import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ViewTickets.module.css';

const ViewTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          created_at,
          last_updated_at,
          agent:agent_id (
            users (
              full_name,
              email
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading tickets...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Your Support Tickets</h1>
          <p className={styles.subtitle}>View and track all your support requests</p>
        </div>
        <Link to="/submit-ticket" className={styles.submitButton}>
          Submit New Ticket
        </Link>
      </div>

      {error && (
        <div className={styles.error}>
          Error loading tickets: {error}
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilter}>
          <Filter size={20} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tickets found.</p>
          {tickets.length > 0 && searchTerm && (
            <p>Try adjusting your search or filter criteria.</p>
          )}
          {tickets.length === 0 && (
            <Link to="/submit-ticket" className={styles.link}>
              Submit your first ticket
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.ticketsList}>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div className={styles.ticketHeader}>
                <h3 className={styles.ticketTitle}>{ticket.title}</h3>
                <span className={`${styles.status} ${styles[ticket.status]}`}>
                  {ticket.status}
                </span>
              </div>
              
              <p className={styles.ticketDescription}>
                {ticket.description.length > 150
                  ? `${ticket.description.substring(0, 150)}...`
                  : ticket.description}
              </p>

              <div className={styles.ticketMeta}>
                <div className={styles.metaGroup}>
                  <span className={styles.metaItem}>
                    <Clock size={16} />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  <span className={`${styles.priority} ${styles[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
                {ticket.agent?.users?.full_name && (
                  <div className={styles.agent}>
                    Assigned to: {ticket.agent.users.full_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewTickets; 