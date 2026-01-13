/*
  # Fix team_join_requests to reference profiles table

  1. Changes
    - Drop existing foreign key constraint for user_id
    - Add new foreign key constraint to profiles table instead of auth.users
    - This allows Supabase PostgREST to properly join with profiles table

  2. Notes
    - This is needed because profiles.id matches auth.users.id
    - PostgREST can only follow foreign key relationships in the public schema
*/

-- Drop the existing foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'team_join_requests_user_id_fkey'
    AND table_name = 'team_join_requests'
  ) THEN
    ALTER TABLE team_join_requests DROP CONSTRAINT team_join_requests_user_id_fkey;
  END IF;
END $$;

-- Add foreign key to profiles table instead
ALTER TABLE team_join_requests
ADD CONSTRAINT team_join_requests_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Same fix for reviewed_by if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'team_join_requests_reviewed_by_fkey'
    AND table_name = 'team_join_requests'
  ) THEN
    ALTER TABLE team_join_requests DROP CONSTRAINT team_join_requests_reviewed_by_fkey;
  END IF;
END $$;

ALTER TABLE team_join_requests
ADD CONSTRAINT team_join_requests_reviewed_by_fkey
FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;
