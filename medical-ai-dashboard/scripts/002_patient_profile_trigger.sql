-- Auto-create patient profile when user signs up
-- This trigger creates a patient record when a new user is created in auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.patients (id, patient_id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'patient_id', 'PAT-' || SUBSTRING(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'Patient')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
