import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const AdminDashboard: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tickets Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tickets</h2>
            <p className="text-gray-600 mb-4">Manage and oversee all customer support tickets</p>
            <Link to="/tickets" className="text-blue-600 hover:text-blue-800">
              View All Tickets →
            </Link>
          </div>

          {/* Customer Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Customers</h2>
            <p className="text-gray-600 mb-4">View and manage customer accounts</p>
            <Link to="/customers" className="text-blue-600 hover:text-blue-800">
              Manage Customers →
            </Link>
          </div>

          {/* Agent Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Agents</h2>
            <p className="text-gray-600 mb-4">Manage support team and agent assignments</p>
            <Link to="/agents" className="text-blue-600 hover:text-blue-800">
              Manage Agents →
            </Link>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
            <Link to="/settings" className="text-blue-600 hover:text-blue-800">
              System Settings →
            </Link>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-gray-600 mb-4">View system performance and metrics</p>
            <Link to="/analytics" className="text-blue-600 hover:text-blue-800">
              View Analytics →
            </Link>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p className="text-gray-600 mb-4">Generate and view system reports</p>
            <Link to="/reports" className="text-blue-600 hover:text-blue-800">
              View Reports →
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard; 