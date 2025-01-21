-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for fixed categories
CREATE TYPE ticket_status AS ENUM (
  'open',
  'in_progress',
  'pending',
  'resolved',
  'closed',
  'reopened'
);

CREATE TYPE ticket_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Tags table for efficient tag management
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main tickets table
CREATE TABLE tickets (
  -- Standard identifiers
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE, -- Human-readable ID (e.g., TKT-2024-001)
  
  -- Core ticket information
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  
  -- Relationships
  customer_id UUID NOT NULL REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  department VARCHAR(100),
  
  -- Metadata and custom fields
  metadata JSONB DEFAULT '{}', -- For dynamic/custom fields
  tags UUID[] DEFAULT ARRAY[]::UUID[], -- Array of tag IDs
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Metrics
  response_time_secs INTEGER, -- Time to first response
  resolution_time_secs INTEGER -- Total time to resolution
);

-- Internal notes table
CREATE TABLE ticket_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation/messages table
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Array of attachment metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments table for file management
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  message_id UUID REFERENCES ticket_messages(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tickets_customer ON tickets(customer_id);
CREATE INDEX idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_metadata ON tickets USING gin(metadata);
CREATE INDEX idx_tickets_tags ON tickets USING gin(tags);

CREATE INDEX idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_notes_ticket ON ticket_notes(ticket_id);
CREATE INDEX idx_attachments_ticket ON ticket_attachments(ticket_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON ticket_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Policies for tickets
CREATE POLICY "Tickets are viewable by customer or support staff"
  ON tickets FOR SELECT
  USING (
    auth.uid() = customer_id OR 
    auth.uid() = assignee_id OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'agent'
    )
  );

CREATE POLICY "Tickets can be created by anyone"
  ON tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Tickets can be updated by support staff"
  ON tickets FOR UPDATE
  USING (
    auth.uid() = assignee_id OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'agent'
    )
  );

-- Policies for notes
CREATE POLICY "Notes are viewable by support staff only"
  ON ticket_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'agent'
    )
  );

-- Policies for messages
CREATE POLICY "Messages are viewable by ticket participants"
  ON ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets 
      WHERE id = ticket_id AND (
        customer_id = auth.uid() OR 
        assignee_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users 
          WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'agent'
        )
      )
    )
  ); 