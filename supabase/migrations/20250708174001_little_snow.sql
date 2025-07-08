/*
  # Create pending users table for approval system

  1. New Tables
    - `pending_users`
      - `id` (uuid, primary key)
      - `name` (text, user's full name)
      - `email` (text, user's email)
      - `institute_id` (text, selected institute ID)
      - `role` (user_role enum, requested role)
      - `created_at` (timestamp, when registration was submitted)

  2. Security
    - Enable RLS on `pending_users` table
    - Add policy for admins to manage pending users
    - Add policy to prevent regular users from accessing pending users

  3. Functions
    - Update handle_new_user function to handle pending approvals
*/

-- Create pending_users table for storing registration requests
CREATE TABLE IF NOT EXISTS public.pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  institute_id TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on pending_users table
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage pending users
CREATE POLICY "Admins can manage pending users" ON public.pending_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update the handle_new_user function to handle pending approvals
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
      'admin'
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
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    
    -- Delete the auth user since we're storing them as pending
    DELETE FROM auth.users WHERE id = NEW.id;
    RETURN NULL;
  END IF;
  
  -- Regular user creation (for approved users)
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
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;