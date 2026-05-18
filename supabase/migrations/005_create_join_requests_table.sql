-- Migration: 005_create_join_requests_table.sql
-- Description: Create join_requests table for ride join requests

CREATE TABLE IF NOT EXISTS join_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  response_message TEXT,
  UNIQUE(ride_id, requester_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_join_requests_ride ON join_requests(ride_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_user ON join_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_created ON join_requests(requested_at DESC);

-- Add comments
COMMENT ON TABLE join_requests IS 'Ride join requests with status tracking';
COMMENT ON COLUMN join_requests.response_message IS 'Optional message from poster when responding to request';