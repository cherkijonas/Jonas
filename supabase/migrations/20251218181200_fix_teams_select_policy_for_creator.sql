/*
  # Fix teams SELECT policy to allow creators to see their newly created teams

  ## Problem
  When creating a team, the sequence is:
  1. INSERT into teams (succeeds)
  2. SELECT to get the created team (FAILS because user is not in team_members yet)
  3. INSERT into team_members (never reached)

  The SELECT policy requires the user to be in team_members, but they aren't added 
  until AFTER the team is created and selected.

  ## Solution
  Modify the SELECT policy to also allow users to see teams they created (via created_by field)
  in addition to teams they are members of.

  ## Changes
  - Drop existing SELECT policy
  - Create new SELECT policy that checks BOTH team_members AND created_by
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;

-- Create new SELECT policy that allows viewing if:
-- 1. User is a member of the team (in team_members), OR
-- 2. User created the team (created_by matches auth.uid())
CREATE POLICY "Users can view their teams"
  ON teams FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by
    OR
    EXISTS (
      SELECT 1
      FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );
