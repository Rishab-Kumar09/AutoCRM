import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import styles from './Dashboard.module.css';

const CustomerDashboard: React.FC = () => {
  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Support Portal</h1>
          <p className={styles.subtitle}>How can we help you today?</p>
        </div>
        
        <div className={styles.grid}>
          {/* Quick Actions */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Quick Actions</h2>
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
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Recent Activity</h2>
            <div className="space-y-4">
              <p className={styles.text}>Your recent ticket activity will appear here.</p>
              <Link 
                to="/tickets"
                className={styles.linkButton}
              >
                View All Activity →
              </Link>
            </div>
          </div>

          {/* Help Resources */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Help Resources</h2>
            <div className="space-y-4">
              <Link 
                to="/help/faq"
                className={styles.linkButton}
              >
                Browse FAQ →
              </Link>
              <Link 
                to="/help/guides"
                className={styles.linkButton}
              >
                View User Guides →
              </Link>
            </div>
          </div>

          {/* Account Settings */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Account Settings</h2>
            <div className="space-y-4">
              <Link 
                to="/profile"
                className={styles.linkButton}
              >
                Edit Profile →
              </Link>
              <Link 
                to="/settings"
                className={styles.linkButton}
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