const TicketCard = ({ id, title, status, priority, customer, assignee, createdAt }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    const statusMap = {
      open: 'badge-blue',
      in_progress: 'badge-yellow',
      resolved: 'badge-green',
      closed: 'badge-gray'
    };
    return statusMap[status] || 'badge-gray';
  };

  const getPriorityClass = (priority) => {
    const priorityMap = {
      low: 'badge-gray',
      medium: 'badge-blue',
      high: 'badge-yellow',
      critical: 'badge-red'
    };
    return priorityMap[priority] || 'badge-gray';
  };

  return (
    <div className="card">
      <div className="ticket-header">
        <div>
          <h3 className="ticket-title">{title}</h3>
          <div className="ticket-id">{id}</div>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${getStatusClass(status)}`}>
            {status.replace('_', ' ')}
          </span>
          <span className={`badge ${getPriorityClass(priority)}`}>
            {priority}
          </span>
        </div>
      </div>
      <div className="ticket-meta">
        <span>From: {customer}</span>
        <span>Assigned: {assignee}</span>
        <span>{formatDate(createdAt)}</span>
      </div>
    </div>
  );
};

export default TicketCard;