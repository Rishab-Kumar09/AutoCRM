import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import styles from './Dashboard.module.css';

const CustomerDashboard: React.FC = () => {
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Support Portal</h1>
          <p className={styles.subtitle}>How can we help you today?</p>
        </div>
        
        <div className={styles.actions}>
          {/* Quick Actions */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className="space-y-4">
              <Link 
                to="/tickets/create"
                className={styles.primaryButton}
              >
                Create New Support Ticket
              </Link>
              <Link 
                to="/tickets"
                className={styles.secondaryButton}
              >
                View My Tickets
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            <div className="space-y-4">
              <p className={styles.emptyState}>Your recent ticket activity will appear here.</p>
              <Link 
                to="/tickets"
                className={styles.link}
              >
                View All Activity →
              </Link>
            </div>
          </div>

          {/* Help Resources */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Help Resources</h2>
            <div className="space-y-4">
              <Link 
                to="/help/faq"
                className={styles.link}
              >
                Browse FAQ →
              </Link>
              <Link 
                to="/help/guides"
                className={styles.link}
              >
                View User Guides →
              </Link>
            </div>
          </div>

          {/* Account Settings */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            <div className="space-y-4">
              <Link 
                to="/profile"
                className={styles.link}
              >
                Edit Profile →
              </Link>
              <Link 
                to="/settings"
                className={styles.link}
              >
                Manage Preferences →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard; 