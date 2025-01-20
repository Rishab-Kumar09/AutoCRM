import React from 'react';
import Layout from '../components/Layout';

const Settings = () => {
  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="ticket-title">Profile Settings</h2>
            <div className="ticket-meta">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input type="text" className="input" placeholder="Your name" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input type="email" className="input" placeholder="Your email" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="ticket-title">Notification Settings</h2>
            <div className="ticket-meta">
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-hover"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="button button-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;