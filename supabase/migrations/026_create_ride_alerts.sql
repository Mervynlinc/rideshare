-- Create ride_alerts table for users to listen for rides to specific locations
CREATE TABLE IF NOT EXISTS ride_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  from_location TEXT,
  to_location TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for looking up alerts by university when a ride is posted
CREATE INDEX IF NOT EXISTS idx_ride_alerts_university ON ride_alerts(university_id);

-- Index for looking up active alerts by user
CREATE INDEX IF NOT EXISTS idx_ride_alerts_user ON ride_alerts(user_id);

-- Enable RLS
ALTER TABLE ride_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts"
ON ride_alerts FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own alerts
CREATE POLICY "Users can create their own alerts"
ON ride_alerts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts (e.g., toggle active)
CREATE POLICY "Users can update their own alerts"
ON ride_alerts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete their own alerts"
ON ride_alerts FOR DELETE
USING (auth.uid() = user_id);
