-- Migration: 006_create_chats_table.sql
-- Description: Create chats table for ride messaging

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  ride_from VARCHAR(255) NOT NULL,
  ride_to VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(ride_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_ride ON chats(ride_id);
CREATE INDEX IF NOT EXISTS idx_chats_expires ON chats(expires_at);
CREATE INDEX IF NOT EXISTS idx_chats_last_message ON chats(last_message_at DESC);

-- Add comments
COMMENT ON TABLE chats IS 'Chat sessions for ride coordination';
COMMENT ON COLUMN chats.expires_at IS 'When chat expires (1 hour after ride completion)';
COMMENT ON COLUMN chats.last_message_at IS 'Timestamp of most recent message';