import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';
import TicketModal from '../../components/TicketModal';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_to: string | null;
}

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-emerald-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tickets</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> New Ticket
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tickets yet. Create your first ticket to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{ticket.subject}</h3>
                    <p className="text-gray-600 text-sm mb-2">{ticket.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`${getPriorityColor(ticket.priority)} text-white text-xs px-2 py-1 rounded-full`}>
                      {ticket.priority}
                    </span>
                    <span className={`${getStatusColor(ticket.status)} text-white text-xs px-2 py-1 rounded-full`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        <TicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTicketCreated={fetchTickets}
        />
      </div>
    </Layout>
  );
};

export default Tickets; 