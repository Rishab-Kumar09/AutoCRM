-- Drop existing table if it exists
DROP TABLE IF EXISTS tickets;

-- Create tickets table with proper structure
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'feature_request', 'bug')),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    assigned_to UUID REFERENCES auth.users(id),
    resolution_notes TEXT
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own tickets
CREATE POLICY "Users can view own tickets"
    ON tickets FOR SELECT
    USING (auth.uid() = customer_id);

-- Allow users to create tickets
CREATE POLICY "Users can create tickets"
    ON tickets FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

-- Allow users to update their own tickets
CREATE POLICY "Users can update own tickets"
    ON tickets FOR UPDATE
    USING (auth.uid() = customer_id);

-- Create index for better query performance
CREATE INDEX tickets_customer_id_idx ON tickets(customer_id);
CREATE INDEX tickets_status_idx ON tickets(status);
CREATE INDEX tickets_created_at_idx ON tickets(created_at DESC); 