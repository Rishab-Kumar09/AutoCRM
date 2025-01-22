import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TicketDetails.module.css';

const TicketDetails = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadTicketData();
  }, [ticketId]);

  const loadTicketData = async () => {
    try {
      setIsLoading(true);
      
      // Get agent's company ID
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (agentError) throw agentError;

      // Load ticket details
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          created_at,
          customer:customer_id (
            email,
            full_name
          )
        `)
        .eq('id', ticketId)
        .eq('company_id', agentData.company_id)
        .single();

      if (ticketError) throw ticketError;

      // Load ticket messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('ticket_messages')
        .select(`
          id,
          content,
          created_at,
          is_agent,
          user:user_id (
            email,
            full_name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      setTicket(ticketData);
      setMessages(messagesData);
    } catch (err) {
      console.error('Error loading ticket data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      setTicket({ ...ticket, status: newStatus });
    } catch (err) {
      console.error('Error updating ticket status:', err);
      setError(err.message);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          content: newMessage.trim(),
          user_id: user.id,
          is_agent: true
        });

      if (error) throw error;

      setNewMessage('');
      loadTicketData(); // Reload messages
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading ticket details...</div>;
  }

  if (!ticket) {
    return <div className={styles.error}>Ticket not found or access denied.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.ticketInfo}>
          <h1 className={styles.title}>{ticket.title}</h1>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Clock size={16} />
              {new Date(ticket.created_at).toLocaleDateString()}
            </span>
            <span className={`${styles.status} ${styles[ticket.status]}`}>
              {ticket.status}
            </span>
            <span className={`${styles.priority} ${styles[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={styles.statusSelect}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.customerInfo}>
        <h2 className={styles.sectionTitle}>Customer</h2>
        <p className={styles.customerDetails}>
          {ticket.customer?.full_name || 'Unknown'}
          <span className={styles.customerEmail}>
            {ticket.customer?.email}
          </span>
        </p>
      </div>

      <div className={styles.description}>
        <h2 className={styles.sectionTitle}>Description</h2>
        <p className={styles.descriptionText}>{ticket.description}</p>
      </div>

      <div className={styles.messages}>
        <h2 className={styles.sectionTitle}>Messages</h2>
        <div className={styles.messagesList}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`${styles.message} ${message.is_agent ? styles.agentMessage : styles.customerMessage}`}
            >
              <div className={styles.messageHeader}>
                <span className={styles.messageSender}>
                  {message.is_agent ? 'Agent' : 'Customer'}: {message.user?.full_name || message.user?.email}
                </span>
                <span className={styles.messageTime}>
                  {new Date(message.created_at).toLocaleString()}
                </span>
              </div>
              <p className={styles.messageContent}>{message.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className={styles.replyForm}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your reply..."
            className={styles.replyInput}
            rows={3}
          />
          <button 
            type="submit" 
            className={styles.sendButton}
            disabled={isSending || !newMessage.trim()}
          >
            <Send size={20} />
            {isSending ? 'Sending...' : 'Send Reply'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetails; 