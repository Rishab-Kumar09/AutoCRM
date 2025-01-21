import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TicketQueue.module.css';

const TicketQueue = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      
      // Get agent's company ID
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (agentError) throw agentError;

      // Load tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          created_at,
          customer:customer_id (
            email,
            full_name
          )
        `)
        .eq('company_id', agentData.company_id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return <div className={styles.loading}>Loading ticket queue...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ticket Queue</h1>
          <p className={styles.subtitle}>Manage and respond to customer support tickets</p>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search tickets by title, description, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
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

          <div className={styles.filterItem}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={styles.select}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tickets found.</p>
          {tickets.length > 0 && (
            <p>Try adjusting your search or filter criteria.</p>
          )}
        </div>
      ) : (
        <div className={styles.ticketsList}>
          {filteredTickets.map((ticket) => (
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
                <div className={styles.customer}>
                  From: {ticket.customer?.full_name || ticket.customer?.email}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketQueue; 