import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Bell, Users } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>

        <div className="settings-layout">
          {/* Settings Navigation */}
          <div className="settings-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'settings-nav-item-active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="settings-section-title">Profile Information</h2>
                  <div className="settings-section-content">
                    <div className="settings-field">
                      <label>Full Name</label>
                      <input type="text" className="input" placeholder="Your name" />
                    </div>
                    <div className="settings-field">
                      <label>Email Address</label>
                      <input type="email" className="input" placeholder="Your email" />
                    </div>
                    <div className="settings-field">
                      <label>Job Title</label>
                      <input type="text" className="input" placeholder="Your role" />
                    </div>
                    <div className="settings-field">
                      <label>Department</label>
                      <select className="input">
                        <option>Customer Support</option>
                        <option>Sales</option>
                        <option>Technical Support</option>
                        <option>Management</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="settings-section-title">Preferences</h2>
                  <div className="settings-section-content">
                    <div className="settings-toggle">
                      <div>
                        <label>Show Online Status</label>
                        <p className="settings-description">Let others see when you're active</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle">
                      <div>
                        <label>Auto-assign Tickets</label>
                        <p className="settings-description">Automatically assign new tickets based on workload</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="settings-section-title">Email Notifications</h2>
                  <div className="settings-section-content">
                    <div className="settings-toggle">
                      <div>
                        <label>New Ticket Assignments</label>
                        <p className="settings-description">When a ticket is assigned to you</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle">
                      <div>
                        <label>Ticket Updates</label>
                        <p className="settings-description">When there are updates to your tickets</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle">
                      <div>
                        <label>Customer Replies</label>
                        <p className="settings-description">When customers reply to tickets</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h2 className="settings-section-title">Desktop Notifications</h2>
                  <div className="settings-section-content">
                    <div className="settings-toggle">
                      <div>
                        <label>Enable Desktop Notifications</label>
                        <p className="settings-description">Show notifications on your desktop</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle">
                      <div>
                        <label>Sound Alerts</label>
                        <p className="settings-description">Play sound for new notifications</p>
                      </div>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="settings-actions">
              <button className="button button-primary">Save Changes</button>
              <button className="button">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;