-- Migration: 010_create_blocked_users_table.sql
-- Description: Create blocked_users table for user blocking

CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_blocked ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_blocked_created ON blocked_users(blocked_at DESC);

-- Add comments
COMMENT ON TABLE blocked_users IS 'User blocking for safety and privacy';
COMMENT ON COLUMN blocked_users.blocker_id IS 'User who blocked another user';
COMMENT ON COLUMN blocked_users.blocked_id IS 'User who was blocked';
COMMENT ON COLUMN blocked_users.reason IS 'Optional reason for blocking';