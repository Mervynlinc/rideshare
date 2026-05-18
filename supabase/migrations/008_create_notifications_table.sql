-- Migration: 008_create_notifications_table.sql
-- Description: Create notifications table for user notifications

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('success', 'warning', 'error', 'info')),
  icon VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  action_url VARCHAR(500),
  metadata JSONB,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Add comments
COMMENT ON TABLE notifications IS 'User notifications for app events';
COMMENT ON COLUMN notifications.metadata IS 'Flexible JSON data for different notification types';
COMMENT ON COLUMN notifications.action_url IS 'Deep link URL for notification action';