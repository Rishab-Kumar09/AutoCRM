import React, { useState, useEffect } from "react";
import TicketCard from "../components/TicketCard";
import { Plus, Search } from "lucide-react";
import { getTickets, createTicket } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await getTickets({
        status: statusFilter === 'all' ? null : statusFilter,
        priority: priorityFilter === 'all' ? null : priorityFilter,
        search: searchQuery
      });
      setTickets(data);
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const newTicket = await createTicket({
        title: "Test Ticket",
        description: "This is a test ticket",
        priority: "medium",
        customer_id: user.id
      });
      setTickets(prev => [newTicket, ...prev]);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (error) {
    return (
      <div className="container">
        <div className="card text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Tickets</h1>
        <button 
          className="button button-primary"
          onClick={handleCreateTicket}
        >
          <Plus size={16} />
          New Ticket
        </button>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
          />
        </div>
        
        <div className="select">
          <button 
            className="select-trigger"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          >
            {statusFilter === 'all' ? 'All Status' : statusFilter.replace('_', ' ')}
          </button>
          {isStatusOpen && (
            <div className="select-content">
              <div className="select-item" onClick={() => { setStatusFilter('all'); setIsStatusOpen(false); }}>All Status</div>
              <div className="select-item" onClick={() => { setStatusFilter('open'); setIsStatusOpen(false); }}>Open</div>
              <div className="select-item" onClick={() => { setStatusFilter('in_progress'); setIsStatusOpen(false); }}>In Progress</div>
              <div className="select-item" onClick={() => { setStatusFilter('resolved'); setIsStatusOpen(false); }}>Resolved</div>
              <div className="select-item" onClick={() => { setStatusFilter('closed'); setIsStatusOpen(false); }}>Closed</div>
            </div>
          )}
        </div>

        <div className="select">
          <button 
            className="select-trigger"
            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
          >
            {priorityFilter === 'all' ? 'All Priority' : priorityFilter}
          </button>
          {isPriorityOpen && (
            <div className="select-content">
              <div className="select-item" onClick={() => { setPriorityFilter('all'); setIsPriorityOpen(false); }}>All Priority</div>
              <div className="select-item" onClick={() => { setPriorityFilter('low'); setIsPriorityOpen(false); }}>Low</div>
              <div className="select-item" onClick={() => { setPriorityFilter('medium'); setIsPriorityOpen(false); }}>Medium</div>
              <div className="select-item" onClick={() => { setPriorityFilter('high'); setIsPriorityOpen(false); }}>High</div>
              <div className="select-item" onClick={() => { setPriorityFilter('urgent'); setIsPriorityOpen(false); }}>Urgent</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tickets found matching your filters.
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
          ))
        )}
      </div>
    </div>
  );
};

export default Tickets;