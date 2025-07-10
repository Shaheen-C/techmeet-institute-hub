/*
  # Fix RLS policies for profiles table

  1. Security Changes
    - Drop existing policies that may cause recursion
    - Create new policies with proper JWT claim access
    - Fix JSON operator syntax for PostgreSQL compatibility
    - Ensure admins can manage all profiles while users can only access their own

  2. Policy Structure
    - Users can view/update their own profile
    - Admins can view/update any profile using JWT claims
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
    COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text OR
    COALESCE(((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR 
    COALESCE(((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text OR
    COALESCE(((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text), ''::text) = 'admin'::text
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);