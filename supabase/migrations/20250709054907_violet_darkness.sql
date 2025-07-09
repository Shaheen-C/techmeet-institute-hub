/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Existing RLS policies cause infinite recursion when checking admin status
    - Policy tries to query profiles table from within profiles table policy

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid recursion by using JWT claims
    - Allow users to manage their own profiles
    - Allow admins to manage all profiles using JWT metadata

  3. Security
    - Users can only view/update their own profiles
    - Admins can view/update all profiles based on JWT role
    - Profile creation allowed during signup process
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
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin' OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin' OR
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);