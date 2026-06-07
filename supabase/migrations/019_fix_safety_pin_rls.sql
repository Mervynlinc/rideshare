-- Migration: 019_fix_safety_pin_rls.sql
-- Description: Fix RLS policies for safety PIN exchange
-- The old SELECT policy only allowed users to view their own ride_participants records,
-- which broke the safety PIN verification flow (both parties need to read each other's PIN).
-- Also adds a missing UPDATE policy that was preventing PIN writes.

-- Drop the overly restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own participations" ON ride_participants;

-- Allow users to view all participants of rides they are in (needed for safety PIN exchange)
CREATE POLICY "Users can view ride participants of their rides"
  ON ride_participants FOR SELECT
  USING (
    ride_id IN (
      SELECT ride_id FROM ride_participants WHERE user_id = auth.uid()
    )
  );

-- Add UPDATE policy for users to update their own participation records
CREATE POLICY "Users can update their own participations"
  ON ride_participants FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
