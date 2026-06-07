-- Migration: 023_trust_score_trigger.sql
-- Description: Auto-recalculate users.trust_score from ratings when a new rating is inserted

CREATE OR REPLACE FUNCTION recalculate_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.users
  SET trust_score = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
    FROM public.ratings
    WHERE rated_user_id = users.id
  )
  WHERE id IN (NEW.rater_id, NEW.rated_user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_rating_inserted
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_trust_score();

-- Recalculate trust scores for all existing users based on current ratings
UPDATE public.users u
SET trust_score = (
  SELECT COALESCE(AVG(r.rating)::DECIMAL(3,2), 0)
  FROM public.ratings r
  WHERE r.rated_user_id = u.id
);
