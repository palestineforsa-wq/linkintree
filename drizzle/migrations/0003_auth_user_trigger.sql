-- ============================================================================
-- 0003 — Auto-create profile on auth.users insert.
-- Trigger reads username from raw_user_meta_data set by signUp({ data: ... }).
-- If username is reserved, raises P0001; the entire signUp txn rolls back.
-- If username is missing (e.g., OAuth signup without preset username), skips
-- profile creation — app routes the user to a username-selection page.
-- Spec §4 + §10 (reserved list enforced in DB, not just app code).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_username citext := NEW.raw_user_meta_data->>'username';
BEGIN
  IF v_username IS NULL OR v_username = '' THEN
    -- OAuth or admin path — username chosen later. Don't insert profile yet.
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.reserved_usernames WHERE username = v_username) THEN
    RAISE EXCEPTION 'username_reserved' USING ERRCODE = 'P0001';
  END IF;

  -- Unique constraint on profiles.username catches concurrent grabs.
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, v_username);
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
