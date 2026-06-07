-- Migration: 022_complete_ride_function.sql
-- Description: Create SECURITY DEFINER function to complete a ride when both participants have verified their safety PINs

CREATE OR REPLACE FUNCTION complete_ride(p_ride_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_participants INTEGER;
  v_verified_participants INTEGER;
BEGIN
  -- Check the caller is a participant of this ride
  IF NOT EXISTS (
    SELECT 1 FROM public.ride_participants
    WHERE ride_id = p_ride_id AND user_id = auth.uid()
  ) THEN
    RETURN FALSE;
  END IF;

  -- Verify the ride exists and is not already completed/cancelled
  IF NOT EXISTS (
    SELECT 1 FROM public.rides
    WHERE id = p_ride_id AND status = 'active'
  ) THEN
    RETURN FALSE;
  END IF;

  -- Count accepted participants and verified participants
  SELECT COUNT(*) INTO v_total_participants
  FROM public.ride_participants
  WHERE ride_id = p_ride_id AND status = 'accepted';

  SELECT COUNT(*) INTO v_verified_participants
  FROM public.ride_participants
  WHERE ride_id = p_ride_id AND status = 'accepted' AND safety_pin_verified = TRUE;

  -- Only complete if ALL accepted participants have verified their PIN
  IF v_verified_participants < v_total_participants OR v_total_participants < 1 THEN
    RETURN FALSE;
  END IF;

  -- Update ride status to completed
  UPDATE public.rides
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_ride_id;

  -- Update all accepted participants to completed
  UPDATE public.ride_participants
  SET
    status = 'completed',
    completed_at = NOW()
  WHERE ride_id = p_ride_id AND status = 'accepted';

  -- Increment rides_completed for all completed participants
  UPDATE public.users
  SET rides_completed = rides_completed + 1
  WHERE id IN (
    SELECT user_id FROM public.ride_participants
    WHERE ride_id = p_ride_id AND status = 'completed'
  );

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION complete_ride(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_ride(UUID) TO authenticated;
