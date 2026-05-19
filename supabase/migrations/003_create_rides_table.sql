-- Migration: 003_create_rides_table.sql
-- Description: Create rides table for ride postings

CREATE TABLE IF NOT EXISTS rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  departure_type VARCHAR(20) NOT NULL CHECK (departure_type IN ('immediate', 'scheduled')),
  scheduled_date DATE,
  scheduled_time TIME,
  closes_at TIMESTAMP WITH TIME ZONE,
  seats_total INTEGER NOT NULL CHECK (seats_total > 0),
  seats_taken INTEGER DEFAULT 0 CHECK (seats_taken >= 0),
  gender_preference VARCHAR(20) NOT NULL CHECK (gender_preference IN ('same', 'any')),
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('boda', 'cab')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rides_poster ON rides(poster_id);
CREATE INDEX IF NOT EXISTS idx_rides_university ON rides(university_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_departure_type ON rides(departure_type);
CREATE INDEX IF NOT EXISTS idx_rides_scheduled ON rides(scheduled_date, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_rides_created ON rides(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_rides_location ON rides(from_location, to_location);

-- Create trigger for updated_at
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE rides IS 'Ride postings with scheduling and capacity information';
COMMENT ON COLUMN rides.seats_total IS 'Total number of available seats';
COMMENT ON COLUMN rides.seats_taken IS 'Number of seats currently booked';
COMMENT ON COLUMN rides.closes_at IS 'When the ride closes for new requests';
COMMENT ON COLUMN rides.gender_preference IS 'same = same gender only, any = any gender';