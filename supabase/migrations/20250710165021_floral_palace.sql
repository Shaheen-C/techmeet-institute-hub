/*
  # Add Sample Institute IDs

  1. New Data
    - Add sample institute IDs for testing and initial setup
    - Include common educational institution patterns
  
  2. Purpose
    - Allow users to sign up with valid institute IDs
    - Provide examples for administrators
*/

-- Insert sample institute IDs
INSERT INTO institute_ids (institute_id, institute_name, is_active) VALUES
  ('TECH001', 'Tech Institute Main Campus', true),
  ('TECH002', 'Tech Institute Branch Campus', true),
  ('EDU001', 'Education University', true),
  ('COLLEGE01', 'Community College District', true),
  ('UNIV001', 'State University', true)
ON CONFLICT (institute_id) DO NOTHING;