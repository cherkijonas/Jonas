/*
  # Add Delete Policy for Transfer Requests

  1. Changes
    - Add DELETE policy for team_transfer_requests table
    - Allow users to delete their own pending transfer requests
  
  2. Security
    - Users can only delete their own requests (where user_id matches auth.uid())
    - This ensures users cannot delete other users' transfer requests
*/

-- Drop existing policy if it exists, then create new one
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'team_transfer_requests' 
    AND policyname = 'Users can delete own transfer requests'
  ) THEN
    DROP POLICY "Users can delete own transfer requests" ON team_transfer_requests;
  END IF;
END $$;

-- Allow users to delete their own transfer requests
CREATE POLICY "Users can delete own transfer requests"
  ON team_transfer_requests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
