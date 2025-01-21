import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Search, Filter, Clock, AlertCircle } from 'lucide-react';
import { getTickets } from '../../lib/supabase';

const Queue = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getTickets({
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery,
      });

      if (fetchError) {
        throw fetchError;
      }

      setTickets(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tickets on mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [searchQuery, statusFilter, priorityFilter]);

  const getPriorityBadgeClass = (priority) => {
    const classes = {
      low: 'badge-gray',
      normal: 'badge-blue',
      high: 'badge-yellow',
      urgent: 'badge-red',
    };
    return 'badge ' + (classes[priority] || 'badge-gray');
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      new: 'badge-yellow',
      open: 'badge-blue',
      pending: 'badge-gray',
      resolved: 'badge-green',
      closed: 'badge-gray',
    };
    return 'badge ' + (classes[status] || 'badge-gray');
  };

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Ticket Queue</h1>
        </div>

        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="filters">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="input"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="select">
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="select">
            <select
              className="input"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div>Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="card">
              <p>No tickets found.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="card">
                <div className="ticket-header">
                  <div>
                    <h3 className="ticket-title">{ticket.subject}</h3>
                    <span className="ticket-id">{ticket.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className={getPriorityBadgeClass(ticket.priority)}>
                      {ticket.priority}
                    </span>
                    <span className={getStatusBadgeClass(ticket.status)}>
                      {ticket.status}
                    </span>
                  </div>
                </div>
                <div className="ticket-meta">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{ticket.category}</span>
                  </div>
                  <div>
                    <span>Customer: {ticket.customer_id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Queue; 