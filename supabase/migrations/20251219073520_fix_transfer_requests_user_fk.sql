/*
  # Fix Transfer Requests Foreign Key

  1. Changes
    - Add missing foreign key constraint for user_id in team_transfer_requests table
    - This allows proper joins with profiles table when fetching transfer requests
  
  2. Security
    - No changes to RLS policies, they remain the same
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_transfer_requests_user_id_fkey'
    AND table_name = 'team_transfer_requests'
  ) THEN
    ALTER TABLE team_transfer_requests
      ADD CONSTRAINT team_transfer_requests_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
  END IF;
END $$;