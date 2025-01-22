import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Please set your Supabase environment variables in .env');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Successfully connected to Supabase');
  }
});

// Add initialization check
export const checkSupabaseConnection = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // First check if we can access the users table
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data->role')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error checking user role:', userError);
      throw userError;
    }

    // Then try to access tickets
    const { data: ticketData, error: ticketError } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);

    if (ticketError) {
      console.error('Error checking tickets access:', ticketError);
      throw ticketError;
    }

    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};

/**
 * Fetches tickets with optional filters
 * @param {Object} options - Query options
 * @param {string} [options.status] - Filter by ticket status
 * @param {string} [options.priority] - Filter by priority
 * @param {string} [options.search] - Search in title and description
 * @returns {Promise<Array<import('../types/tickets').Ticket>>}
 */
export async function getTickets({ status, priority, search } = {}) {
  try {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        customer:customer_id(email, raw_user_meta_data->name),
        assignee:assignee_id(email, raw_user_meta_data->name)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getTickets:', error);
    throw error;
  }
}

/**
 * Creates a new ticket
 * @param {Object} ticket - The ticket data
 * @param {string} ticket.title - Ticket title
 * @param {string} ticket.description - Ticket description
 * @param {string} ticket.priority - Ticket priority
 * @param {string} ticket.customer_id - Customer ID
 * @returns {Promise<import('../types/tickets').Ticket>}
 */
export async function createTicket({ title, description, priority, customer_id }) {
  try {
    // Generate ticket number (format: TKT-YYYY-XXXX)
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });
    
    const ticketNumber = `TKT-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('tickets')
      .insert([
        {
          ticket_number: ticketNumber,
          title,
          description,
          priority,
          status: 'open',
          customer_id,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        customer:customer_id(email, raw_user_meta_data->name),
        assignee:assignee_id(email, raw_user_meta_data->name)
      `)
      .single();

    if (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createTicket:', error);
    throw error;
  }
}

/**
 * Updates a ticket
 * @param {string} id - The ticket ID
 * @param {Partial<import('../types/tickets').Ticket>} updates - The fields to update
 * @returns {Promise<import('../types/tickets').Ticket>}
 */
export async function updateTicket(id, updates) {
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }

  return data;
}

/**
 * Adds a note to a ticket
 * @param {import('../types/tickets').TicketNote} note - The note data
 * @returns {Promise<import('../types/tickets').TicketNote>}
 */
export async function addTicketNote(note) {
  const { data, error } = await supabase
    .from('ticket_notes')
    .insert(note)
    .select()
    .single();

  if (error) {
    console.error('Error adding note:', error);
    throw error;
  }

  return data;
}

/**
 * Adds a message to a ticket
 * @param {import('../types/tickets').TicketMessage} message - The message data
 * @returns {Promise<import('../types/tickets').TicketMessage>}
 */
export async function addTicketMessage(message) {
  const { data, error } = await supabase
    .from('ticket_messages')
    .insert(message)
    .select()
    .single();

  if (error) {
    console.error('Error adding message:', error);
    throw error;
  }

  return data;
}

// Auth helper functions
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });
  return { data, error };
};

// Ticket related functions
export const updateTicketStatus = async (ticketId, status) => {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
    .select();
  return { data, error };
}; 