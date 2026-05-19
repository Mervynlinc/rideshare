-- Migration: 004_create_ride_participants_table.sql
-- Description: Create ride_participants table for user-ride relationships

CREATE TABLE IF NOT EXISTS ride_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  safety_pin_verified BOOLEAN DEFAULT FALSE,
  safety_pin_exchange_at TIMESTAMP WITH TIME ZONE,
  rating_given INTEGER CHECK (rating_given >= 1 AND rating_given <= 5),
  rating_received INTEGER CHECK (rating_received >= 1 AND rating_received <= 5),
  rating_comment TEXT,
  UNIQUE(ride_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_ride ON ride_participants(ride_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON ride_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_status ON ride_participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_rating ON ride_participants(rating_received);
CREATE INDEX IF NOT EXISTS idx_participants_safety ON ride_participants(safety_pin_verified);

-- Add comments
COMMENT ON TABLE ride_participants IS 'Many-to-many relationship between users and rides';
COMMENT ON COLUMN ride_participants.safety_pin_verified IS 'Whether safety PIN exchange was completed';
COMMENT ON COLUMN ride_participants.rating_given IS 'Rating this user gave to others';
COMMENT ON COLUMN ride_participants.rating_received IS 'Rating this user received from others';