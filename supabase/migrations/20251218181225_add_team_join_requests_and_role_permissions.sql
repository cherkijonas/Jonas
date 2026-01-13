/*
  # Add Team Join Requests System

  1. New Tables
    - `team_join_requests`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `status` (text: pending, approved, rejected)
      - `message` (text, optional message from user)
      - `reviewed_by` (uuid, references auth.users)
      - `reviewed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `team_join_requests`
    - Users can create their own join requests
    - Users can view their own join requests
    - Team owners/admins can view and manage requests for their teams

  3. Notes
    - Managers (role = 'manager' in profiles) can create teams directly
    - Members (role = 'member' in profiles) must request to join teams
    - Admins (role = 'admin' in profiles) have full access
*/

-- Create team_join_requests table
CREATE TABLE IF NOT EXISTS team_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id, status)
);

-- Enable RLS
ALTER TABLE team_join_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own join requests
CREATE POLICY "Users can create join requests"
  ON team_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own join requests
CREATE POLICY "Users can view own join requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Team owners/admins can view all requests for their teams
CREATE POLICY "Team owners can view team requests"
  ON team_join_requests FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id 
      FROM team_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Team owners/admins can update requests (approve/reject)
CREATE POLICY "Team owners can manage requests"
  ON team_join_requests FOR UPDATE
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_team_join_requests_team_id ON team_join_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_user_id ON team_join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_team_join_requests_status ON team_join_requests(status);
