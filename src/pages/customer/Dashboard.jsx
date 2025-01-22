import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Ticket, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Dashboard.module.css';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only load tickets if user is authenticated
    if (user) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [user]); // Add user as dependency

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError(null); // Reset error state
      
      // Double check user is still authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          updated_at,
          ticket_number
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (supabaseError) throw supabaseError;
      setTickets(data || []); // Ensure we always set an array
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.message);
      setTickets([]); // Reset tickets on error
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to login if no user
  if (!user && !isLoading) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={loadTickets} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Dashboard</h1>
        <p className={styles.subtitle}>View and manage your support tickets</p>
      </div>

      <div className={styles.actions}>
        <Link to="/submit-ticket" className={styles.primaryButton}>
          <Ticket size={20} />
          Submit New Ticket
        </Link>
        <Link to="/tickets" className={styles.secondaryButton}>
          <MessageSquare size={20} />
          View All Tickets
        </Link>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Tickets</h2>
        {tickets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven't submitted any tickets yet.</p>
            <Link to="/submit-ticket" className={styles.link}>
              Submit your first ticket
            </Link>
          </div>
        ) : (
          <div className={styles.ticketsList}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className={styles.ticketCard}>
                <div className={styles.ticketHeader}>
                  <h3 className={styles.ticketTitle}>{ticket.title}</h3>
                  <span className={`${styles.status} ${styles[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className={styles.ticketMeta}>
                  <span className={styles.ticketNumber}>#{ticket.ticket_number}</span>
                  <span className={styles.metaItem}>
                    <Clock size={16} />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <span className={`${styles.priority} ${styles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard; 