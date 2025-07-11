-- Check if user_role enum exists and create it if not
DO $$ 
BEGIN
    -- First, check if user_role type exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the user_role enum
        CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
        RAISE NOTICE 'Created user_role enum type';
    ELSE
        RAISE NOTICE 'user_role enum type already exists';
    END IF;
END $$;

-- Also ensure the handle_new_user function uses the correct enum type casting
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_institute_id TEXT;
  user_status TEXT;
BEGIN
  user_institute_id := COALESCE(NEW.raw_user_meta_data->>'institute_id', '');
  user_status := COALESCE(NEW.raw_user_meta_data->>'status', '');
  
  -- Skip validation for admin email
  IF NEW.email = 'shaheenshanu246@gmail.com' THEN
    INSERT INTO public.profiles (id, name, email, institute_id, role)
    VALUES (
      NEW.id,
      'Admin User',
      NEW.email,
      'ADMIN',
      'admin'::public.user_role
    );
    RETURN NEW;
  END IF;
  
  -- If user status is approved, create profile directly
  IF user_status = 'approved' THEN
    -- Validate institute ID
    IF NOT public.validate_institute_id(user_institute_id) THEN
      RAISE EXCEPTION 'Invalid institute ID: %', user_institute_id;
    END IF;
    
    INSERT INTO public.profiles (id, name, email, institute_id, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      user_institute_id,
      COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
    );
    RETURN NEW;
  END IF;
  
  -- If user status is pending_approval, store in pending_users table
  IF user_status = 'pending_approval' THEN
    -- Validate institute ID
    IF NOT public.validate_institute_id(user_institute_id) THEN
      RAISE EXCEPTION 'Invalid institute ID: %', user_institute_id;
    END IF;
    
    -- Store in pending_users table instead of creating profile
    INSERT INTO public.pending_users (name, email, institute_id, role)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      user_institute_id,
      COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
    );
    
    -- Delete the auth user since we're storing them as pending
    DELETE FROM auth.users WHERE id = NEW.id;
    RETURN NULL;
  END IF;
  
  -- Regular user creation (for approved users) - default case
  -- Validate institute ID for regular users
  IF NOT public.validate_institute_id(user_institute_id) THEN
    RAISE EXCEPTION 'Invalid institute ID: %', user_institute_id;
  END IF;
  
  INSERT INTO public.profiles (id, name, email, institute_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    user_institute_id,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;