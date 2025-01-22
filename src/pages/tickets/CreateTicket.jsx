import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, createTicket } from '../../lib/supabase';
import Layout from '../../components/Layout';
import styles from './CreateTicket.module.css';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low'
  });

  // Check user authentication and table structure on component mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Check authentication status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Authentication status:', {
          session: session ? 'present' : 'missing',
          user: session?.user,
          error: sessionError
        });

        if (!session) {
          console.error('No active session found');
          return;
        }

        // Log user information
        console.log('Current user:', user);
        
        // First, check if the table exists
        const { data: tableInfo, error: tableError } = await supabase
          .from('tickets')
          .select('*')
          .limit(1);
        
        console.log('Table check:', { 
          exists: !tableError,
          error: tableError?.message,
          details: tableError?.details 
        });

        // Check table structure
        const { data: structureData, error: structureError } = await supabase
          .rpc('get_table_info', { table_name: 'tickets' })
          .select('*');

        console.log('Table structure:', {
          data: structureData,
          error: structureError?.message
        });

        // Try a simple insert with required fields
        const testTicket = {
          title: 'Test Ticket',
          description: 'Testing ticket creation',
          priority: 'normal',
          customer_id: session.user.id,
          status: 'open',
          ticket_number: `TEST-${Date.now()}`
        };

        console.log('Attempting test insert with:', testTicket);

        const { data: insertTest, error: insertError } = await supabase
          .from('tickets')
          .insert(testTicket)
          .select()
          .single();
        
        console.log('Insert test result:', { 
          success: !!insertTest,
          error: insertError?.message,
          details: insertError?.details,
          data: insertTest 
        });
        
        // Clean up test ticket if created
        if (insertTest?.id) {
          await supabase
            .from('tickets')
            .delete()
            .eq('id', insertTest.id);
        }
      } catch (err) {
        console.error('Setup check error:', {
          message: err.message,
          details: err.details,
          hint: err.hint,
          stack: err.stack
        });
      }
    };
    
    checkSetup();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication failed. Please try logging in again.');
      }

      if (!session) {
        throw new Error('You must be logged in to create a ticket');
      }

      // Generate ticket number
      const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Prepare ticket data
      const ticketData = {
        ticket_number: ticketNumber,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority.toLowerCase(),
        customer_id: session.user.id,
        status: 'open',
        created_at: new Date().toISOString()
      };

      console.log('Creating ticket:', ticketData);

      const createdTicket = await createTicket(ticketData);
      console.log('Ticket created successfully:', createdTicket);
      navigate('/tickets');
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        cause: err.cause,
        stack: err.stack
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.error}>
            Please log in to create a ticket
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Create New Ticket</h1>
        
        {error && (
          <div className={styles.error}>
            Failed to create ticket: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter ticket title"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.textarea}
              rows={5}
              placeholder="Describe your issue"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateTicket; 