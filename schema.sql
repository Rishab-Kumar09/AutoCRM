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

-- Users table (handled by Supabase Auth)
-- This is managed by Supabase, but here's the structure for reference
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  invited_at TIMESTAMP WITH TIME ZONE,
  confirmation_token TEXT,
  confirmation_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_token TEXT,
  recovery_sent_at TIMESTAMP WITH TIME ZONE,
  email_change_token_new TEXT,
  email_change TEXT,
  email_change_sent_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  phone TEXT UNIQUE,
  phone_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone_change TEXT,
  phone_change_token TEXT,
  phone_change_sent_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  email_change_token_current TEXT,
  email_change_confirm_status SMALLINT,
  banned_until TIMESTAMP WITH TIME ZONE,
  reauthentication_token TEXT,
  reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
  is_sso_user BOOLEAN,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Companies table
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  industry TEXT,
  website TEXT,
  support_email TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id)
);

-- Role management enums
CREATE TYPE agent_role AS ENUM (
  'light_agent',    -- Can view and comment, cannot solve tickets
  'agent',          -- Standard support agent
  'team_lead',      -- Team management + agent capabilities
  'admin'           -- Full organization access
);

CREATE TYPE agent_status AS ENUM (
  'invited',
  'active',
  'suspended',
  'declined'
);

-- Update agents table with Zendesk-style roles
CREATE TABLE public.agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  role agent_role NOT NULL DEFAULT 'agent',
  status agent_status NOT NULL DEFAULT 'invited',
  access_restrictions JSONB DEFAULT '{}',  -- For light agents' restricted access
  signature TEXT,                         -- Agent's default signature
  max_tickets INTEGER,                    -- Ticket limit (null for unlimited)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, company_id)
);

-- Organizations (sub-groups within companies for end-users)
CREATE TABLE public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  domain TEXT[],                         -- Auto-assign users from these domains
  details JSONB DEFAULT '{}',            -- Custom fields
  notes TEXT,                           -- Internal notes about organization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update customers table with organization support
CREATE TABLE public.customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  organization_id UUID REFERENCES public.organizations(id),
  role TEXT NOT NULL DEFAULT 'end_user' CHECK (role IN ('end_user', 'org_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  is_verified BOOLEAN DEFAULT false,      -- Email verification status
  details JSONB DEFAULT '{}',            -- Custom user fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, company_id)
);

-- Agent Groups (similar to Zendesk's groups)
CREATE TABLE public.agent_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,        -- Visible to end-users?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Group Members
CREATE TABLE public.agent_group_members (
  group_id UUID REFERENCES public.agent_groups(id),
  agent_id UUID REFERENCES public.agents(id),
  is_default BOOLEAN DEFAULT false,      -- Agent's default group
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (group_id, agent_id)
);

-- Schedule table for agent availability
CREATE TABLE public.schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  hours JSONB NOT NULL,                  -- Weekly schedule
  holidays JSONB DEFAULT '[]',           -- Holiday calendar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent schedules
CREATE TABLE public.agent_schedules (
  agent_id UUID REFERENCES public.agents(id),
  schedule_id UUID REFERENCES public.schedules(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (agent_id, schedule_id)
);

-- Update tickets table with Zendesk-specific fields
ALTER TABLE tickets ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE tickets ADD COLUMN group_id UUID REFERENCES public.agent_groups(id);
ALTER TABLE tickets ADD COLUMN brand_id UUID;  -- For multi-brand support
ALTER TABLE tickets ADD COLUMN channel TEXT DEFAULT 'web';  -- web, email, api, etc.
ALTER TABLE tickets ADD COLUMN first_reply_time_secs INTEGER;
ALTER TABLE tickets ADD COLUMN solve_time_secs INTEGER;
ALTER TABLE tickets ADD COLUMN reopens INTEGER DEFAULT 0;
ALTER TABLE tickets ADD COLUMN satisfaction_score INTEGER;  -- CSAT rating
ALTER TABLE tickets ADD COLUMN satisfaction_comment TEXT;   -- CSAT comment

-- RLS Policies for new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;

-- Organization policies
CREATE POLICY "Organizations are viewable by company members" ON public.organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = organizations.company_id
      AND (
        c.admin_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.agents a
          WHERE a.company_id = c.id
          AND a.user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM public.customers cu
          WHERE cu.company_id = c.id
          AND cu.user_id = auth.uid()
        )
      )
    )
  );

-- Agent group policies
CREATE POLICY "Agent groups are viewable by company members" ON public.agent_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = agent_groups.company_id
      AND (
        c.admin_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.agents a
          WHERE a.company_id = c.id
          AND a.user_id = auth.uid()
        )
      )
    )
  );

-- Functions for Zendesk-style automation
CREATE OR REPLACE FUNCTION auto_assign_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign organization based on email domain
  IF NEW.email IS NOT NULL THEN
    WITH matching_org AS (
      SELECT o.id
      FROM public.organizations o
      WHERE EXISTS (
        SELECT 1
        FROM unnest(o.domain) domain
        WHERE NEW.email LIKE '%@' || domain
      )
      LIMIT 1
    )
    UPDATE public.customers
    SET organization_id = matching_org.id
    FROM matching_org
    WHERE customers.user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_assign_org
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'role' = 'customer')
  EXECUTE FUNCTION auto_assign_organization();

-- Companies policies
CREATE POLICY "Companies are viewable by authenticated users" ON public.companies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Companies can be created by anyone" ON public.companies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Companies can be updated by company admin" ON public.companies
  FOR UPDATE USING (auth.uid() = admin_id);

-- Agents policies
CREATE POLICY "Agents are viewable by company members" ON public.agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = agents.company_id
      AND (
        c.admin_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.agents a
          WHERE a.company_id = c.id
          AND a.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Agents can be created by company admin" ON public.agents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE id = company_id
      AND admin_id = auth.uid()
    )
  );

-- RLS Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_team_members ENABLE ROW LEVEL SECURITY;

-- Functions and Triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'company_admin' THEN
    -- Nothing to do, company creation is handled separately
    RETURN NEW;
  ELSIF NEW.raw_user_meta_data->>'role' = 'agent' THEN
    INSERT INTO public.agents (user_id, company_id, status)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'company_id')::uuid, 'pending');
  ELSIF NEW.raw_user_meta_data->>'role' = 'customer' THEN
    INSERT INTO public.customers (user_id, company_id)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'company_id')::uuid);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invites table for managing invitations
CREATE TABLE public.invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('agent', 'customer')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- RLS for invites
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Only company admins can create invites for their own company
CREATE POLICY "Invites can be created by company admin" ON public.invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = company_id  -- company_id from the invite being inserted
      AND c.admin_id = auth.uid()  -- current user must be the company admin
      AND EXISTS (
        SELECT 1 FROM auth.users u
        WHERE u.id = auth.uid()
        AND u.raw_user_meta_data->>'role' = 'company_admin'
      )
    )
  );

-- Invites can be viewed by the creator or the invitee
CREATE POLICY "Invites are viewable by creator or invitee" ON public.invites
  FOR SELECT USING (
    created_by = auth.uid()
    OR email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Function to clean up expired invites
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS void AS $$
BEGIN
  DELETE FROM public.invites
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run cleanup every day
SELECT cron.schedule(
  'cleanup-expired-invites',
  '0 0 * * *',
  $$SELECT cleanup_expired_invites()$$
); 