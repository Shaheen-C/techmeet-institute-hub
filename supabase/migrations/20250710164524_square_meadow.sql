/*
  # Fix RLS policies to prevent infinite recursion

  1. Security Changes
    - Drop existing policies that cause recursion
    - Create new policies using JWT claims to avoid database lookups
    - Maintain proper access control for users and admins

  2. Policy Updates
    - Users can view and update their own profiles
    - Admins can view and update all profiles using JWT metadata
    - Profile creation allowed during signup
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

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
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::text, '') = 'admin'
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text, '') = 'admin' OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role')::text, '') = 'admin'
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);