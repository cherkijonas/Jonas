/*
  # Allow viewing all teams for transfer requests

  1. Changes
    - Update the SELECT policy on teams table to allow authenticated users to view all teams
    - This is necessary so users can see team names when viewing their transfer requests
    - Users need to see teams they want to join even if they're not members yet

  2. Security
    - Users can only read team information (SELECT), not modify it
    - Write operations (INSERT/UPDATE/DELETE) remain restricted as before
    - This allows displaying team names in transfer requests without security risk
*/

DROP POLICY IF EXISTS "Users can view their teams" ON teams;

CREATE POLICY "Authenticated users can view all teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);