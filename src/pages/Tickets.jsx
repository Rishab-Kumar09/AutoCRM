import React, { useState } from "react";
import TicketCard from "../components/TicketCard";
import { Plus, Search } from "lucide-react";

// Mock data for initial development
const mockTickets = [
  {
    id: "TKT-001",
    title: "Cannot access email account",
    status: "open",
    priority: "high",
    customer: "John Doe",
    assignee: "Sarah Tech",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "TKT-002",
    title: "Printer not responding",
    status: "in_progress",
    priority: "medium",
    customer: "Jane Smith",
    assignee: "Mike Support",
    createdAt: "2024-02-19T15:30:00Z",
  },
  {
    id: "TKT-003",
    title: "Software license expired",
    status: "resolved",
    priority: "low",
    customer: "Bob Wilson",
    assignee: "Lisa Admin",
    createdAt: "2024-02-18T09:15:00Z",
  },
];

const Tickets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Tickets</h1>
        <button className="button button-primary">
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
              <div className="select-item" onClick={() => { setPriorityFilter('critical'); setIsPriorityOpen(false); }}>Critical</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <TicketCard key={ticket.id} {...ticket} />
        ))}
        {filteredTickets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tickets found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;