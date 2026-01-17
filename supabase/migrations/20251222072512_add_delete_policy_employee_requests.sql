/*
  # Add DELETE policy for employee_requests

  1. Security Changes
    - Add policy allowing employees to delete their own pending requests
    - Ensures data safety by only allowing deletion of pending requests
    
  2. Important Notes
    - Employees can only delete their own requests
    - Only pending requests can be deleted (approved/rejected requests are kept for history)
*/

-- Policy: Employees can delete their own pending requests
CREATE POLICY "Employees can delete own pending requests"
  ON employee_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');
