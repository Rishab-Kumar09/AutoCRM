import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Ticket, Clock, AlertCircle } from 'lucide-react';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeTickets: 0,
    avgResponseTime: 0,
    resolvedTickets: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('admin_id', user.id)
        .single();

      if (companyError) throw companyError;

      // Load stats
      const [agentsCount, ticketsData] = await Promise.all([
        // Get total agents
        supabase
          .from('agents')
          .select('id', { count: 'exact' })
          .eq('company_id', companyData.id),
        
        // Get tickets data
        supabase
          .from('tickets')
          .select('*')
          .eq('company_id', companyData.id)
      ]);

      if (agentsCount.error) throw agentsCount.error;
      if (ticketsData.error) throw ticketsData.error;

      // Calculate stats
      const activeTickets = ticketsData.data.filter(t => t.status !== 'closed').length;
      const resolvedTickets = ticketsData.data.filter(t => t.status === 'closed').length;
      
      // Get recent tickets
      const { data: recent, error: recentError } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          title,
          status,
          priority,
          created_at,
          users (
            full_name,
            email
          )
        `)
        .eq('company_id', companyData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setStats({
        totalAgents: agentsCount.count,
        activeTickets,
        avgResponseTime: '2h 15m', // TODO: Calculate actual average
        resolvedTickets
      });

      setRecentTickets(recent);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <AlertCircle className="w-6 h-6 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">Total Agents</h3>
            <Users className="w-6 h-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">{stats.totalAgents}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">Active Tickets</h3>
            <Ticket className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{stats.activeTickets}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">Avg. Response Time</h3>
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{stats.avgResponseTime}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500">Resolved Tickets</h3>
            <Ticket className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{stats.resolvedTickets}</p>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
          {recentTickets.length === 0 ? (
            <p className="text-gray-500">No tickets found.</p>
          ) : (
            <div className="divide-y">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{ticket.title}</p>
                      <div className="text-sm text-gray-500">
                        {ticket.ticket_number} • {ticket.users.full_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        ticket.status === 'open'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        ticket.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : ticket.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard; 