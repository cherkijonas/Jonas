/*
  # Ensure Manager Team Membership Consistency

  1. Purpose
    - Ensures that all managers with assigned_team_id have a corresponding entry in team_members
    - Creates a trigger to automatically maintain this consistency going forward

  2. Changes
    - Creates a function to sync manager team memberships
    - Adds a trigger on profiles table for INSERT/UPDATE operations
    - Backfills missing team_members entries for existing managers

  3. Security
    - Maintains existing RLS policies
    - Ensures data consistency without breaking existing functionality
*/

-- Function to ensure manager has team_members entry
CREATE OR REPLACE FUNCTION ensure_manager_team_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if role is manager and assigned_team_id is set
  IF NEW.role = 'manager' AND NEW.assigned_team_id IS NOT NULL THEN
    -- Check if team_members entry already exists
    IF NOT EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = NEW.assigned_team_id 
      AND user_id = NEW.id
    ) THEN
      -- Create the team_members entry
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (NEW.assigned_team_id, NEW.id, 'owner')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS sync_manager_team_membership ON profiles;
CREATE TRIGGER sync_manager_team_membership
  AFTER INSERT OR UPDATE OF role, assigned_team_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_manager_team_membership();

-- Backfill missing team_members entries for existing managers
INSERT INTO team_members (team_id, user_id, role)
SELECT 
  p.assigned_team_id,
  p.id,
  'owner'
FROM profiles p
WHERE p.role = 'manager' 
  AND p.assigned_team_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.team_id = p.assigned_team_id 
    AND tm.user_id = p.id
  )
ON CONFLICT DO NOTHING;
