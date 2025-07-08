
-- Fix the user_role enum issue by ensuring it exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
    END IF;
END $$;

-- Create institute_ids table for admin to manage allowed institute IDs
CREATE TABLE public.institute_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id TEXT NOT NULL UNIQUE,
  institute_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for institute_ids table
ALTER TABLE public.institute_ids ENABLE ROW LEVEL SECURITY;

-- Only admins can manage institute IDs
CREATE POLICY "Admins can manage institute IDs" ON public.institute_ids
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert some default institute IDs
INSERT INTO public.institute_ids (institute_id, institute_name) VALUES
  ('TECH001', 'Tech Institute Main Campus'),
  ('TECH002', 'Tech Institute Branch Campus'),
  ('ENGG001', 'Engineering College'),
  ('MED001', 'Medical College'),
  ('ARTS001', 'Arts & Science College');

-- Create a function to validate institute ID during signup
CREATE OR REPLACE FUNCTION public.validate_institute_id(check_institute_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.institute_ids 
    WHERE institute_id = check_institute_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to validate institute ID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_institute_id TEXT;
BEGIN
  user_institute_id := COALESCE(NEW.raw_user_meta_data->>'institute_id', '');
  
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

-- Create trigger for updating institute_ids updated_at
CREATE TRIGGER update_institute_ids_updated_at BEFORE UPDATE ON public.institute_ids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
