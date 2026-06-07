-- Migration: 027_create_ride_history_table.sql
-- Description: Create ride_history table to store completed ride details for history

CREATE TABLE ride_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  poster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poster_name VARCHAR(255) NOT NULL,
  other_party_name VARCHAR(255) NOT NULL,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('boda', 'cab')),
  was_poster BOOLEAN NOT NULL DEFAULT FALSE,
  posted_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX ride_history_user_id_idx ON ride_history(user_id);
CREATE INDEX ride_history_date_idx ON ride_history(date DESC);

ALTER TABLE ride_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ride history"
  ON ride_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert ride history"
  ON ride_history FOR INSERT
  WITH CHECK (true);
