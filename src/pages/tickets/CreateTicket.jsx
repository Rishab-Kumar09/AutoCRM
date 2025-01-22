import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Layout from '../../components/Layout';

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    category: 'general',
  });

  // Check user authentication and table structure on component mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        // Log user information
        console.log('Current user:', user);
        
        // Check if we can access the tickets table
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .limit(1);
        
        console.log('Table access check:', { data, error });
        
        // Test RLS policies
        const { data: insertTest, error: insertError } = await supabase
          .from('tickets')
          .insert([
            {
              subject: 'Test Ticket',
              description: 'Testing ticket creation',
              priority: 'normal',
              category: 'general',
              status: 'new',
              customer_id: user?.id,
            },
          ])
          .select()
          .single();
          
        console.log('Insert test:', { data: insertTest, error: insertError });
        
        // Clean up test ticket if created
        if (insertTest?.id) {
          const { error: deleteError } = await supabase
            .from('tickets')
            .delete()
            .eq('id', insertTest.id);
            
          console.log('Cleanup test:', { error: deleteError });
        }
      } catch (err) {
        console.error('Setup check error:', err);
      }
    };
    
    if (user) {
      checkSetup();
    } else {
      console.log('No user found');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('You must be logged in to create a ticket');
      }

      console.log('Creating ticket with data:', {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: 'new',
        customer_id: user.id,
      });

      const { data, error: insertError } = await supabase
        .from('tickets')
        .insert([
          {
            subject: formData.subject,
            description: formData.description,
            priority: formData.priority,
            category: formData.category,
            status: 'new',
            customer_id: user.id,
          },
        ])
        .select()
        .single();

      console.log('Insert response:', { data, error: insertError });

      if (insertError) throw insertError;

      // Redirect to the ticket detail page
      navigate(`/tickets/${data.id}`);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create ticket');
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              Please log in to create a ticket
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Create New Support Ticket</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTicket; 