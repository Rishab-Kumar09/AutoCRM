import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to AutoCRM</h1>
        <p className={styles.subtitle}>
          The intelligent customer support platform for modern businesses
        </p>
        <div className={styles.actions}>
          <Link to="/companies" className={styles.primaryButton}>
            Find Support
          </Link>
          <Link to="/company/register" className={styles.secondaryButton}>
            Register Your Company
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 