/*
  # Fix Profiles RLS Infinite Recursion

  ## Problem
  The "Users can view team members profiles" policy causes infinite recursion
  because it queries the profiles table within the policy itself, creating a loop.

  ## Solution
  Simplify the RLS policies to avoid self-referencing:
  1. Drop the problematic policy
  2. Create simpler policies that don't cause recursion
  3. Allow users to view profiles of team members through team_members table only
  4. Remove the manager check that references profiles table

  ## Changes
  - Drop existing "Users can view team members profiles" policy
  - Create new simplified policy without self-reference
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view team members profiles" ON profiles;

-- Create a simpler policy that allows viewing team members
-- This only checks team_members table, not profiles table, avoiding recursion
CREATE POLICY "Users can view team members profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1
      FROM team_members tm1
      INNER JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = profiles.id
    )
  );
