/*
  # Fix RLS policies for employee_requests to allow managers to see team requests

  1. Security Changes
    - Drop and recreate the manager view policy to properly check team membership
    - Managers can see requests from employees in teams they manage (as owner or admin)
    - Fix the policy logic to work correctly with team hierarchy
    
  2. Important Notes
    - Managers with owner or admin role in a team can see requests from all members of that team
    - Employees can still only see their own requests
    - Maintains data safety by checking team membership
*/

-- Drop existing manager policies
DROP POLICY IF EXISTS "Managers can view team requests" ON employee_requests;
DROP POLICY IF EXISTS "Managers can update team requests" ON employee_requests;

-- Policy: Managers (owners/admins) can view requests from their team members
CREATE POLICY "Managers can view team requests"
  ON employee_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm_manager
      JOIN team_members tm_employee ON tm_manager.team_id = tm_employee.team_id
      WHERE tm_employee.user_id = employee_requests.user_id
        AND tm_manager.user_id = auth.uid()
        AND tm_manager.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'manager'
    )
  );

-- Policy: Managers (owners/admins) can update requests from their team members
CREATE POLICY "Managers can update team requests"
  ON employee_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM team_members tm_manager
      JOIN team_members tm_employee ON tm_manager.team_id = tm_employee.team_id
      WHERE tm_employee.user_id = employee_requests.user_id
        AND tm_manager.user_id = auth.uid()
        AND tm_manager.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM team_members tm_manager
      JOIN team_members tm_employee ON tm_manager.team_id = tm_employee.team_id
      WHERE tm_employee.user_id = employee_requests.user_id
        AND tm_manager.user_id = auth.uid()
        AND tm_manager.role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'manager'
    )
  );
