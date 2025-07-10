/*
  # Fix Institute IDs Loading Issue

  1. Security
    - Add RLS policies for institute_ids table to allow public read access
    - Ensure pending_users table has proper RLS policies
  
  2. Data
    - Insert sample institute IDs if they don't exist
    - Ensure data is accessible to authenticated users

  3. Changes
    - Add public read policy for institute_ids
    - Add proper policies for pending_users table
    - Insert sample data
*/

-- Enable RLS on institute_ids if not already enabled
ALTER TABLE institute_ids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can view active institute IDs" ON institute_ids;
DROP POLICY IF EXISTS "Admins can manage institute IDs" ON institute_ids;

-- Allow public read access to active institute IDs (needed for signup validation)
CREATE POLICY "Public can view active institute IDs"
  ON institute_ids
  FOR SELECT
  TO public
  USING (is_active = true);

-- Allow admins to manage institute IDs
CREATE POLICY "Admins can manage institute IDs"
  ON institute_ids
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Enable RLS on pending_users if not already enabled
ALTER TABLE pending_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage pending users" ON pending_users;
DROP POLICY IF EXISTS "Public can insert pending users" ON pending_users;

-- Allow public to insert pending users (for signup)
CREATE POLICY "Public can insert pending users"
  ON pending_users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to manage pending users
CREATE POLICY "Admins can manage pending users"
  ON pending_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Insert sample institute IDs if they don't exist
INSERT INTO institute_ids (institute_id, institute_name, is_active) VALUES
  ('TECH001', 'Tech Institute Main Campus', true),
  ('TECH002', 'Tech Institute Branch Campus', true),
  ('EDU001', 'Education University', true),
  ('COLLEGE01', 'Community College District', true),
  ('UNIV001', 'State University', true),
  ('DEMO001', 'Demo Institute', true)
ON CONFLICT (institute_id) DO UPDATE SET
  institute_name = EXCLUDED.institute_name,
  is_active = EXCLUDED.is_active;