export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customer_id: string;
  assignee_id?: string;
  department?: string;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  response_time_secs?: number;
  resolution_time_secs?: number;
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  message_id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
} 