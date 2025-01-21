import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Auth helper functions
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const signUp = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'customer' }
      }
    });

    if (!error && data?.user) {
      // Immediately try to sign in after successful signup
      return await signIn(email, password);
    }

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Ticket related functions
export const createTicket = async (ticketData) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        subject: ticketData.subject,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        status: 'new',
        customer_id: (await supabase.auth.getUser()).data.user?.id,
      },
    ])
    .select();
  return { data, error };
};

export const getTickets = async (filters = {}) => {
  let query = supabase.from('tickets').select('*');

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority);
  }
  if (filters.search) {
    query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

export const updateTicketStatus = async (ticketId, status) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
    .select();
  return { data, error };
}; 