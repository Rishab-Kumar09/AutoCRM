import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, AlertCircle } from 'lucide-react';
import styles from './AgentManagement.module.css';

const AgentManagement = () => {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('admin_id', user.id)
        .single();

      if (companyError) throw companyError;

      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select(`
          id,
          user_id,
          status,
          created_at,
          users (
            email,
            full_name
          )
        `)
        .eq('company_id', companyData.id);

      if (agentsError) throw agentsError;

      setAgents(agentsData);
    } catch (err) {
      console.error('Error loading agents:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteAgent = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      setError(null);

      // Get company ID
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('admin_id', user.id)
        .single();

      if (companyError) throw companyError;

      // Create invite
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          company_id: companyData.id,
          email: inviteEmail,
          role: 'agent',
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          created_by: user.id
        });

      if (inviteError) throw inviteError;

      // Clear form and reload agents
      setInviteEmail('');
      await loadAgents();
      alert('Invitation sent successfully!');
    } catch (err) {
      console.error('Error inviting agent:', err);
      setError(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading agents...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Agent Management</h1>
        <p className={styles.subtitle}>Manage your support team members</p>
      </div>

      {error && (
        <div className={styles.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className={styles.inviteSection}>
        <h2 className={styles.sectionTitle}>Invite New Agent</h2>
        <form onSubmit={handleInviteAgent} className={styles.inviteForm}>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={20} />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter agent's email"
              className={styles.input}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.inviteButton}
            disabled={isInviting}
          >
            <UserPlus size={20} />
            {isInviting ? 'Sending Invite...' : 'Invite Agent'}
          </button>
        </form>
      </div>

      <div className={styles.agentsList}>
        <h2 className={styles.sectionTitle}>Current Agents</h2>
        {agents.length === 0 ? (
          <p className={styles.noAgents}>No agents yet. Invite some team members!</p>
        ) : (
          <div className={styles.agentsGrid}>
            {agents.map((agent) => (
              <div key={agent.id} className={styles.agentCard}>
                <div className={styles.agentInfo}>
                  <h3 className={styles.agentName}>{agent.users?.full_name || 'Pending'}</h3>
                  <p className={styles.agentEmail}>{agent.users?.email}</p>
                  <span className={`${styles.agentStatus} ${styles[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManagement; 