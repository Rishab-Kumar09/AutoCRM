import React from 'react';
import { Plus, Search } from 'lucide-react';

const mockCustomers = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    joinDate: '2024-01-15'
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    joinDate: '2024-01-18'
  }
];

const Customers = () => {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <button className="button button-primary">
          <Plus size={16} />
          New Customer
        </button>
      </div>

      <div className="filters">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            className="input"
          />
        </div>
      </div>

      <div className="space-y-4">
        {mockCustomers.map((customer) => (
          <div key={customer.id} className="card">
            <div className="ticket-header">
              <div>
                <h3 className="ticket-title">{customer.name}</h3>
                <div className="ticket-id">{customer.id}</div>
              </div>
              <span className="badge badge-blue">
                {customer.status}
              </span>
            </div>
            <div className="ticket-meta">
              <span>{customer.email}</span>
              <span>Joined: {new Date(customer.joinDate).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;