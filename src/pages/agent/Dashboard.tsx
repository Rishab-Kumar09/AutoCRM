import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const AgentDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Tickets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Tickets</h2>
            <p className="text-gray-600 mb-4">View and manage your assigned tickets</p>
            <Link to="/tickets?status=active" className="text-blue-600 hover:text-blue-800">
              View Active Tickets →
            </Link>
          </div>

          {/* Customer Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customers</h2>
            <p className="text-gray-600 mb-4">View customer information and history</p>
            <Link to="/customers" className="text-blue-600 hover:text-blue-800">
              View Customers →
            </Link>
          </div>

          {/* Knowledge Base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
            <p className="text-gray-600 mb-4">Access support articles and resources</p>
            <Link to="/knowledge-base" className="text-blue-600 hover:text-blue-800">
              Browse Resources →
            </Link>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Performance</h2>
            <p className="text-gray-600 mb-4">View your performance metrics</p>
            <Link to="/performance" className="text-blue-600 hover:text-blue-800">
              View Metrics →
            </Link>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Schedule</h2>
            <p className="text-gray-600 mb-4">View and manage your work schedule</p>
            <Link to="/schedule" className="text-blue-600 hover:text-blue-800">
              View Schedule →
            </Link>
          </div>

          {/* Team Chat */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Team Chat</h2>
            <p className="text-gray-600 mb-4">Communicate with your team</p>
            <Link to="/team-chat" className="text-blue-600 hover:text-blue-800">
              Open Chat →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AgentDashboard; 