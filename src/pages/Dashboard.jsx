import React from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        
        {/* Dashboard content will go here */}
        <div className="card">
          <h2 className="ticket-title">Welcome to AutoCRM</h2>
          <p className="ticket-meta">Your customer management dashboard</p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 