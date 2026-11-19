-- Migration: 028_insert_ride_history_on_complete.sql
-- Description: Update complete_ride function to insert records into ride_history

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

  -- Insert ride history for the poster
  INSERT INTO public.ride_history (user_id, ride_id, date, from_location, to_location, poster_id, poster_name, other_party_name, mode, was_poster, posted_at)
  SELECT
    r.poster_id,
    r.id,
    CURRENT_DATE,
    r.from_location,
    r.to_location,
    r.poster_id,
    pu.name,
    COALESCE(
      (SELECT STRING_AGG(u.name, ', ')
       FROM public.ride_participants rp
       JOIN public.users u ON u.id = rp.user_id
       WHERE rp.ride_id = p_ride_id
         AND rp.status = 'completed'
         AND rp.user_id != r.poster_id),
      'Unknown'
    ),
    r.mode,
    TRUE,
    r.posted_at
  FROM public.rides r
  JOIN public.users pu ON pu.id = r.poster_id
  WHERE r.id = p_ride_id;

  -- Insert ride history for each participant (excluding poster)
  INSERT INTO public.ride_history (user_id, ride_id, date, from_location, to_location, poster_id, poster_name, other_party_name, mode, was_poster, posted_at)
  SELECT
    rp.user_id,
    r.id,
    CURRENT_DATE,
    r.from_location,
    r.to_location,
    r.poster_id,
    pu.name,
    pu.name,
    r.mode,
    FALSE,
    r.posted_at
  FROM public.ride_participants rp
  JOIN public.rides r ON r.id = rp.ride_id
  JOIN public.users pu ON pu.id = r.poster_id
  WHERE rp.ride_id = p_ride_id
    AND rp.status = 'completed'
    AND rp.user_id != r.poster_id;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION complete_ride(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION complete_ride(UUID) TO authenticated;
