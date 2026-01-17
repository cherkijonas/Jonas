/*
  # Allow Managers to View Join Request User Profiles

  1. Purpose
    - Allows managers to view profiles of users who have submitted join requests to their teams
    - Fixes the issue where managers couldn't see join requests because they couldn't access requester profiles

  2. Changes
    - Drops and recreates the "Users can view team members profiles" policy
    - Adds condition to allow viewing profiles of users with pending join requests to managed teams

  3. Security
    - Maintains existing security - managers can only see profiles of users who have requested to join their teams
    - Does not expose any other user data
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view team members profiles" ON profiles;

-- Recreate policy with join requests support
CREATE POLICY "Users can view team members profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid() AND tm2.user_id = profiles.id
    )
    OR EXISTS (
      SELECT 1 FROM team_transfer_requests
      WHERE team_transfer_requests.user_id = profiles.id
      AND (
        team_transfer_requests.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.team_id = team_transfer_requests.to_team_id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'admin')
        )
      )
    )
    OR EXISTS (
      SELECT 1 FROM team_join_requests
      WHERE team_join_requests.user_id = profiles.id
      AND EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = team_join_requests.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.role IN ('owner', 'admin')
      )
    )
  );
