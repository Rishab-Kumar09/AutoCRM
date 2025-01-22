import React from 'react';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome to your AutoCRM dashboard</p>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Open Tickets</h3>
          <div className={styles.statValue}>12</div>
        </div>
        <div className={styles.statCard}>
          <h3>Resolved Today</h3>
          <div className={styles.statValue}>5</div>
        </div>
        <div className={styles.statCard}>
          <h3>Active Customers</h3>
          <div className={styles.statValue}>128</div>
        </div>
        <div className={styles.statCard}>
          <h3>Response Time</h3>
          <div className={styles.statValue}>2.4h</div>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>🎫</div>
            <div className={styles.activityContent}>
              <h4>New ticket created</h4>
              <p>Login issue reported by John Doe</p>
              <span className={styles.timestamp}>2 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>✅</div>
            <div className={styles.activityContent}>
              <h4>Ticket resolved</h4>
              <p>Payment integration fixed for ABC Corp</p>
              <span className={styles.timestamp}>4 hours ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>👤</div>
            <div className={styles.activityContent}>
              <h4>New customer added</h4>
              <p>XYZ Industries joined the platform</p>
              <span className={styles.timestamp}>1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 