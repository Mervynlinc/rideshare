-- Migration: 009_create_ratings_table.sql
-- Description: Create ratings table for user ratings

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ride_id, rater_id, rated_user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rater ON ratings(rater_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ride ON ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created ON ratings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ratings_value ON ratings(rating);

-- Add comments
COMMENT ON TABLE ratings IS 'User ratings for completed rides';
COMMENT ON COLUMN ratings.rater_id IS 'User who gave the rating';
COMMENT ON COLUMN ratings.rated_user_id IS 'User who received the rating';
COMMENT ON COLUMN ratings.comment IS 'Optional comment explaining the rating';