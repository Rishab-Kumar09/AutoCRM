import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './SubmitTicket.module.css';

const SubmitTicket = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    email: '',
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Get or create user
      let userId;
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new end-user
        const { data: newUser, error: userError } = await supabase.auth.signUp({
          email: formData.email,
          password: Math.random().toString(36).slice(-8), // Generate random password
          options: {
            data: {
              role: 'end_user',
              name: formData.name
            }
          }
        });

        if (userError) throw userError;
        userId = newUser.user.id;
      }

      // 2. Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert([
          {
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority,
            requester_id: userId,
            status: 'new'
          }
        ])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // 3. Show success message
      setSuccess(true);
      setFormData({
        subject: '',
        description: '',
        priority: 'normal',
        email: '',
        name: ''
      });

    } catch (err) {
      console.error('Error submitting ticket:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Submit a Support Request</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div className={styles.success}>
            Your ticket has been submitted successfully! We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              name="name"
              required
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Subject</label>
            <input
              type="text"
              name="subject"
              required
              className={styles.input}
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief summary of your issue"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              required
              className={`${styles.input} ${styles.textarea}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide as much detail as possible"
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Priority</label>
            <select
              name="priority"
              className={styles.input}
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low - Minor issue or question</option>
              <option value="normal">Normal - Standard support request</option>
              <option value="high">High - Significant impact on business</option>
              <option value="urgent">Urgent - Critical business impact</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicket; 