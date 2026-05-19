-- Migration: 012_add_rides_rls.sql
-- Description: Enable Row Level Security on rides, ride_participants, and join_requests

-- Enable RLS
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;

-- Rides policies
CREATE POLICY "Users can view rides from their university"
  ON rides FOR SELECT
  USING (
    university_id IN (
      SELECT university_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own rides"
  ON rides FOR INSERT
  WITH CHECK (poster_id = auth.uid());

CREATE POLICY "Ride posters can update their own rides"
  ON rides FOR UPDATE
  USING (poster_id = auth.uid());

CREATE POLICY "Ride posters can delete their own rides"
  ON rides FOR DELETE
  USING (poster_id = auth.uid());

-- Ride participants policies
CREATE POLICY "Users can view their own participations"
  ON ride_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can join rides"
  ON ride_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Join requests policies
CREATE POLICY "Users can view join requests for their rides or their own requests"
  ON join_requests FOR SELECT
  USING (
    ride_id IN (SELECT id FROM rides WHERE poster_id = auth.uid())
    OR requester_id = auth.uid()
  );

CREATE POLICY "Users can create join requests"
  ON join_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Ride posters can update join request status"
  ON join_requests FOR UPDATE
  USING (
    ride_id IN (SELECT id FROM rides WHERE poster_id = auth.uid())
  );
