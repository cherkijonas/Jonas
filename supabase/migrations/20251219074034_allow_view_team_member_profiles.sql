/*
  # Allow viewing profiles in team context

  1. Changes
    - Add policy to allow viewing profiles of team members
    - This enables managers to see who is requesting to join their team
    - Users can see their own profile information in transfer requests

  2. Security
    - Users can view their own profile (existing policy)
    - Users can view profiles of people in their teams
    - Users can view profiles in the context of team transfer requests
*/

CREATE POLICY "Users can view team members profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = profiles.id
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
  );