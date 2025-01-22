-- First, drop everything in the correct order
DROP TABLE IF EXISTS tickets CASCADE;
DROP TYPE IF EXISTS ticket_status CASCADE;
DROP TYPE IF EXISTS ticket_priority CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the ENUM types with explicit schema
DO $$ BEGIN
    CREATE TYPE public.ticket_status AS ENUM (
        'open',
        'in_progress',
        'pending',
        'resolved',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.ticket_priority AS ENUM (
        'low',
        'normal',
        'high',
        'urgent'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the tickets table with explicit type references
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status public.ticket_status NOT NULL DEFAULT 'open'::public.ticket_status,
    priority public.ticket_priority NOT NULL DEFAULT 'normal'::public.ticket_priority,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    assignee_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created ON tickets(created_at);

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Create policies for access control
CREATE POLICY "Users can view their own tickets"
    ON tickets FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own tickets"
    ON tickets FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own tickets"
    ON tickets FOR UPDATE
    USING (auth.uid() = customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 