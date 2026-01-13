/*
  # Create employee_requests table

  1. New Tables
    - `employee_requests`
      - `id` (uuid, primary key) - Unique identifier for each request
      - `user_id` (uuid, foreign key) - References the employee making the request
      - `team_id` (uuid, foreign key, nullable) - References the team if applicable
      - `manager_id` (uuid, foreign key, nullable) - References the manager who will handle the request
      - `type` (text) - Type of request: 'time_off', 'resource', 'equipment', 'support', 'other'
      - `title` (text) - Short title of the request
      - `description` (text) - Detailed description of what is being requested
      - `status` (text) - Status: 'pending', 'approved', 'rejected'
      - `priority` (text, default 'normal') - Priority level: 'low', 'normal', 'high', 'urgent'
      - `manager_response` (text, nullable) - Manager's response or notes
      - `created_at` (timestamptz) - When the request was created
      - `updated_at` (timestamptz) - When the request was last updated
      - `resolved_at` (timestamptz, nullable) - When the request was approved/rejected
      
  2. Security
    - Enable RLS on `employee_requests` table
    - Policy for employees to create and view their own requests
    - Policy for employees to update only pending requests they created
    - Policy for managers to view all requests from their team members
    - Policy for managers to update request status and add responses
    
  3. Important Notes
    - Employees can only see and modify their own requests
    - Managers can see all requests from team members and update status
    - Auto-update timestamp on modification
*/

-- Create the employee_requests table
CREATE TABLE IF NOT EXISTS employee_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('time_off', 'resource', 'equipment', 'support', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  manager_response text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_employee_requests_user_id ON employee_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_manager_id ON employee_requests(manager_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_team_id ON employee_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_status ON employee_requests(status);
CREATE INDEX IF NOT EXISTS idx_employee_requests_created_at ON employee_requests(created_at DESC);

-- Enable RLS
ALTER TABLE employee_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can create requests
CREATE POLICY "Employees can create own requests"
  ON employee_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Employees can view their own requests
CREATE POLICY "Employees can view own requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Employees can update their own pending requests
CREATE POLICY "Employees can update own pending requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Policy: Managers can view requests from their team members
CREATE POLICY "Managers can view team requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      JOIN profiles p ON tm1.user_id = p.id
      WHERE tm2.user_id = employee_requests.user_id
        AND tm1.user_id = auth.uid()
        AND p.role = 'manager'
    )
  );

-- Policy: Managers can update requests from their team members
CREATE POLICY "Managers can update team requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      JOIN profiles p ON tm1.user_id = p.id
      WHERE tm2.user_id = employee_requests.user_id
        AND tm1.user_id = auth.uid()
        AND p.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      JOIN profiles p ON tm1.user_id = p.id
      WHERE tm2.user_id = employee_requests.user_id
        AND tm1.user_id = auth.uid()
        AND p.role = 'manager'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Set resolved_at when status changes from pending
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    NEW.resolved_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamps
DROP TRIGGER IF EXISTS employee_requests_updated_at ON employee_requests;
CREATE TRIGGER employee_requests_updated_at
  BEFORE UPDATE ON employee_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_requests_updated_at();