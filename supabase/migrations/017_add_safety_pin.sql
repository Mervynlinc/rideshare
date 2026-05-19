-- Migration: 017_add_safety_pin.sql
-- Description: Add safety_pin column to ride_participants for PIN exchange

ALTER TABLE ride_participants
ADD COLUMN IF NOT EXISTS safety_pin VARCHAR(4);

COMMENT ON COLUMN ride_participants.safety_pin IS '4-digit PIN for in-person identity verification';
