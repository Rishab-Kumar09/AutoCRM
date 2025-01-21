import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Send } from 'lucide-react';
import { createTicket } from '../../lib/supabase';

const SubmitTicket = () => {
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    category: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: submitError } = await createTicket(ticketData);
      
      if (submitError) {
        throw submitError;
      }

      // Redirect to ticket view or list
      navigate('/tickets');
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Submit a Ticket</h1>
        </div>

        <div className="card">
          {error && (
            <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="settings-field">
              <label>Subject</label>
              <input
                type="text"
                className="input"
                placeholder="Brief description of your issue"
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="settings-field">
              <label>Description</label>
              <textarea
                className="input"
                rows={5}
                placeholder="Please provide details about your issue..."
                value={ticketData.description}
                onChange={(e) => setTicketData({ ...ticketData, description: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="settings-field">
              <label>Priority</label>
              <select
                className="input"
                value={ticketData.priority}
                onChange={(e) => setTicketData({ ...ticketData, priority: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Category</label>
              <select
                className="input"
                value={ticketData.category}
                onChange={(e) => setTicketData({ ...ticketData, category: e.target.value })}
                required
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="settings-actions">
              <button 
                type="submit" 
                className="button button-primary"
                disabled={isSubmitting}
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitTicket; 