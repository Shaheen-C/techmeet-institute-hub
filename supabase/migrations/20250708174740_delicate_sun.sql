/*
  # Fix infinite recursion in profiles RLS policies

  1. Security Policy Updates
    - Remove recursive admin policy that causes infinite loop
    - Add proper role-based policies using auth.jwt() claims
    - Ensure users can read their own profiles
    - Allow admins to view all profiles without recursion

  2. Changes Made
    - Drop existing problematic policies
    - Create new non-recursive policies using JWT claims
    - Maintain security while avoiding circular dependencies
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies that don't cause recursion
-- Users can view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles (using JWT claims to avoid recursion)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'user_metadata' ->> 'role')::text = 'admin' OR
    (auth.jwt() ->> 'app_metadata' ->> 'role')::text = 'admin'
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    (auth.jwt() ->> 'user_metadata' ->> 'role')::text = 'admin' OR
    (auth.jwt() ->> 'app_metadata' ->> 'role')::text = 'admin'
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);