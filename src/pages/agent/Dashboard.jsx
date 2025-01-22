import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, Clock, Users, BarChart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    openTickets: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0
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
      
      // Get agent's company ID
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (agentError) throw agentError;

      // Load recent tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          customer:customer_id (
            email,
            full_name
          )
        `)
        .eq('company_id', agentData.company_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ticketsError) throw ticketsError;

      // Calculate stats (in a real app, these would be more sophisticated calculations)
      const openTickets = ticketsData.filter(t => t.status === 'open').length;
      
      setStats({
        openTickets,
        resolvedToday: Math.floor(Math.random() * 10), // Placeholder
        avgResponseTime: Math.floor(Math.random() * 60), // Placeholder
        customerSatisfaction: 95 // Placeholder
      });
      
      setRecentTickets(ticketsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Agent Dashboard</h1>
        <p className={styles.subtitle}>Monitor and manage support tickets</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Inbox size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statLabel}>Open Tickets</h3>
            <p className={styles.statValue}>{stats.openTickets}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Clock size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statLabel}>Avg. Response Time</h3>
            <p className={styles.statValue}>{stats.avgResponseTime}m</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statLabel}>Resolved Today</h3>
            <p className={styles.statValue}>{stats.resolvedToday}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <BarChart size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3 className={styles.statLabel}>Customer Satisfaction</h3>
            <p className={styles.statValue}>{stats.customerSatisfaction}%</p>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Tickets</h2>
          <Link to="/agent/queue" className={styles.sectionLink}>
            View All Tickets
          </Link>
        </div>

        {error && (
          <div className={styles.error}>
            Error loading tickets: {error}
          </div>
        )}

        {recentTickets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tickets assigned yet.</p>
          </div>
        ) : (
          <div className={styles.ticketsList}>
            {recentTickets.map((ticket) => (
              <Link 
                to={`/agent/ticket/${ticket.id}`}
                key={ticket.id} 
                className={styles.ticketCard}
              >
                <div className={styles.ticketHeader}>
                  <h3 className={styles.ticketTitle}>{ticket.title}</h3>
                  <span className={`${styles.status} ${styles[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className={styles.ticketMeta}>
                  <span className={styles.customer}>
                    {ticket.customer?.full_name || ticket.customer?.email}
                  </span>
                  <span className={`${styles.priority} ${styles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard; 