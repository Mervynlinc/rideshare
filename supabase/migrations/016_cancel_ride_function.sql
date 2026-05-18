-- Migration: 016_cancel_ride_function.sql
-- Description: Create SECURITY DEFINER function to cancel rides (bypasses PostgREST RLS quirks)

CREATE OR REPLACE FUNCTION cancel_ride(p_ride_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_poster_id UUID;
BEGIN
  SELECT poster_id INTO v_poster_id FROM public.rides WHERE id = p_ride_id;
  IF v_poster_id IS NULL THEN
    RETURN FALSE;
  END IF;
  IF v_poster_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  UPDATE public.rides
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_ride_id AND poster_id = auth.uid();
  RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION cancel_ride(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_ride(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_ride(UUID) TO anon;
