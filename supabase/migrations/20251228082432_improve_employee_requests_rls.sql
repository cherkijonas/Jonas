/*
  # Improve Employee Requests RLS Policies

  ## Problem
  Current RLS policies for employee_requests are too complex and may prevent proper access.
  Managers need to be able to view and update requests from employees in their team.

  ## Changes
  1. Simplify manager policies for viewing and updating employee requests
  2. Allow managers to see requests from employees in their assigned team
  3. Maintain security by ensuring employees can only see their own requests

  ## Security
  - Employees can only view/modify their own pending requests
  - Managers can view/update all requests from their team
  - All policies require authentication
*/

-- Drop and recreate the manager policies with simpler logic
DROP POLICY IF EXISTS "Managers can view team requests" ON employee_requests;
DROP POLICY IF EXISTS "Managers can update team requests" ON employee_requests;

-- Managers can view all employee requests (simplified)
-- A manager can view requests if:
-- 1. They have role='manager' in profiles
-- 2. The employee who created the request is in a team where the manager is assigned
CREATE POLICY "Managers can view employee requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (
    -- User can view their own requests
    auth.uid() = user_id
    OR
    -- OR user is a manager and can view requests from employees in their team
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
      AND (
        -- Manager's assigned team matches the request's team
        p.assigned_team_id = employee_requests.team_id
        OR
        -- OR the employee who made the request is in the manager's team
        EXISTS (
          SELECT 1 FROM team_members tm
          JOIN profiles emp ON emp.id = employee_requests.user_id
          WHERE tm.user_id = employee_requests.user_id
          AND tm.team_id = p.assigned_team_id
        )
      )
    )
  );

-- Managers can update employee requests
CREATE POLICY "Managers can update employee requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (
    -- User can update their own pending requests
    (auth.uid() = user_id AND status = 'pending')
    OR
    -- OR user is a manager
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
      AND (
        -- Manager's assigned team matches the request's team
        p.assigned_team_id = employee_requests.team_id
        OR
        -- OR the employee who made the request is in the manager's team
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.user_id = employee_requests.user_id
          AND tm.team_id = p.assigned_team_id
        )
      )
    )
  )
  WITH CHECK (
    -- User can only update their own requests to pending status
    (auth.uid() = user_id AND status = 'pending')
    OR
    -- OR user is a manager (managers can update to any status)
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
    )
  );
