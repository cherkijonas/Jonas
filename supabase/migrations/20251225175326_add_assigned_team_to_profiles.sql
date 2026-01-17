/*
  # Add assigned_team field to profiles for multi-tenant architecture

  1. Schema Changes
    - Add `assigned_team_id` column to profiles table
    - This field references the teams table
    - Managers are assigned to ONE specific team
    - NULL for employees (they can be members of multiple teams)
    
  2. Security
    - Maintains existing RLS policies
    - Managers can only see data from their assigned team
    
  3. Important Notes
    - This enables strict team isolation for managers
    - Each manager is locked to their assigned team
    - Employees remain flexible (can join multiple teams)
*/

-- Add assigned_team_id column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'assigned_team_id'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN assigned_team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_team 
  ON profiles(assigned_team_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.assigned_team_id IS 'The team assigned to this manager. NULL for employees who can join multiple teams.';
