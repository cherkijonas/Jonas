/*
  # Fix Integrations RLS for Managers

  ## Problem
  Current RLS policy only allows `owner` and `admin` roles in team_members to manage integrations.
  However, managers (users with role='manager' in profiles) need to be able to manage integrations.

  ## Changes
  1. Drop existing restrictive policies
  2. Create new policies that allow:
     - Team members with owner/admin role in team_members table
     - Users with manager role in profiles table who are part of the team
     - All team members can view integrations

  ## Security
  - Maintains RLS protection
  - Allows proper access for managers
  - Team members can only view integrations for their teams
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Team admins can manage integrations" ON integrations;
DROP POLICY IF EXISTS "Team members can view integrations" ON integrations;

-- Allow team members to view integrations
CREATE POLICY "Team members can view integrations"
  ON integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Allow managers and team admins to insert integrations
CREATE POLICY "Managers can insert integrations"
  ON integrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Allow managers and team admins to update integrations
CREATE POLICY "Managers can update integrations"
  ON integrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Allow managers and team admins to delete integrations
CREATE POLICY "Managers can delete integrations"
  ON integrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    )
    OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );
