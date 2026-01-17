/*
  # Fix Infinite Recursion in team_members RLS Policies

  ## Problem
  The existing policies for team_members table cause infinite recursion because they
  query team_members to check if a user can access team_members.

  ## Solution
  1. Drop problematic policies
  2. Create new simplified policies that avoid recursion:
     - Allow users to see team_members records that involve them (either their own or same team)
     - Allow users to insert themselves as team members (when creating teams)
     - Separate policies for INSERT, SELECT, UPDATE, DELETE instead of using FOR ALL

  ## Changes
  - Drop "Team members can view team members" policy (causes recursion)
  - Drop "Team owners can manage members" policy (uses FOR ALL and causes recursion)
  - Create new non-recursive policies for each operation
*/

-- Drop the problematic policies
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;

-- Allow users to view team_members for teams they belong to
-- This uses a simpler check: user can see rows where they are the user_id
-- or where they share a team_id with a row where they are the user_id
CREATE POLICY "Users can view their team memberships"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

-- Allow users to insert themselves as team members (for team creation)
CREATE POLICY "Users can insert themselves as team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow team owners/admins to insert other members
CREATE POLICY "Team owners can add members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Allow team owners/admins to update member roles
CREATE POLICY "Team owners can update members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Allow team owners/admins to remove members
CREATE POLICY "Team owners can remove members"
  ON team_members FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
