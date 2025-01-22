import React from 'react';

const TicketCard = ({ 
  ticket_number,
  title, 
  status, 
  priority,
  customer,
  assignee,
  created_at
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      pending: 'bg-orange-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500',
      reopened: 'bg-purple-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  return (
    <div className="card">
      <div className="ticket-header">
        <div>
          <h3 className="ticket-title">{title}</h3>
          <div className="ticket-id">{ticket_number}</div>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${getStatusColor(status)}`}>
            {status.replace('_', ' ')}
          </span>
          <span className={`badge ${getPriorityColor(priority)}`}>
            {priority}
          </span>
        </div>
      </div>
      <div className="ticket-meta">
        <span>From: {customer?.email || 'Unknown'}</span>
        <span>Assigned: {assignee?.email || 'Unassigned'}</span>
        <span>{formatDate(created_at)}</span>
      </div>
    </div>
  );
};

export default TicketCard;