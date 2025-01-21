/**
 * @typedef {'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened'} TicketStatus
 * @typedef {'low' | 'medium' | 'high' | 'urgent'} TicketPriority
 */

/**
 * @typedef {Object} Tag
 * @property {string} id - Unique identifier for the tag
 * @property {string} name - Name of the tag
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} Ticket
 * @property {string} id - Unique identifier for the ticket
 * @property {string} ticket_number - Human-readable ticket number (e.g., TKT-2024-001)
 * @property {string} title - Ticket title
 * @property {string} description - Detailed description of the issue
 * @property {TicketStatus} status - Current status of the ticket
 * @property {TicketPriority} priority - Priority level
 * @property {string} customer_id - ID of the customer who created the ticket
 * @property {string} [assignee_id] - ID of the agent assigned to the ticket
 * @property {string} [department] - Department handling the ticket
 * @property {Object} metadata - Custom fields as key-value pairs
 * @property {string[]} tags - Array of tag IDs
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string} [resolved_at] - When the ticket was resolved
 * @property {string} [closed_at] - When the ticket was closed
 * @property {number} [response_time_secs] - Time to first response in seconds
 * @property {number} [resolution_time_secs] - Total time to resolution in seconds
 */

/**
 * @typedef {Object} TicketNote
 * @property {string} id - Unique identifier for the note
 * @property {string} ticket_id - ID of the associated ticket
 * @property {string} author_id - ID of the note author
 * @property {string} content - Note content
 * @property {boolean} is_private - Whether the note is internal only
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} TicketMessage
 * @property {string} id - Unique identifier for the message
 * @property {string} ticket_id - ID of the associated ticket
 * @property {string} sender_id - ID of the message sender
 * @property {string} content - Message content
 * @property {Array<{name: string, url: string, type: string, size: number}>} attachments - Array of attached files
 * @property {string} created_at - Creation timestamp
 */

/**
 * @typedef {Object} TicketAttachment
 * @property {string} id - Unique identifier for the attachment
 * @property {string} ticket_id - ID of the associated ticket
 * @property {string} [message_id] - ID of the associated message
 * @property {string} file_name - Original file name
 * @property {string} file_type - MIME type of the file
 * @property {number} file_size - Size in bytes
 * @property {string} storage_path - Path where the file is stored
 * @property {string} uploaded_by - ID of the user who uploaded the file
 * @property {string} created_at - Upload timestamp
 */ 