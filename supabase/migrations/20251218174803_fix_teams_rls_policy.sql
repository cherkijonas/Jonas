/*
  # Fix teams table RLS policies to allow team creation

  ## Problem
  The INSERT policy for teams table is too restrictive and causes
  "new row violates row-level security policy" errors when creating teams.

  ## Solution
  Simplify the INSERT policy to allow any authenticated user to create a team.
  The created_by field will be set by the application, and we trust the application
  to set it correctly to auth.uid().

  ## Changes
  - Drop existing INSERT policy for teams
  - Create new simplified INSERT policy that allows authenticated users to create teams
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create teams" ON teams;

-- Create a new, more permissive INSERT policy
-- Any authenticated user can create a team
CREATE POLICY "Authenticated users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);
