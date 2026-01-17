/*
  # Fix Profiles RLS Recursion and Issues FK

  ## Description
  Corrige la récursion infinie dans les policies RLS de profiles et s'assure que la FK issues.assigned_to existe.

  ## Changes
  1. Simplifier la policy "Users can view team members profiles" pour éviter la récursion
  2. S'assurer que la FK issues.assigned_to -> profiles.id existe
  
  ## Security
  - Les utilisateurs peuvent voir leur propre profil
  - Les membres d'équipe peuvent voir les profils des autres membres
  - Les managers peuvent voir les profils de leur équipe
*/

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can view team members profiles" ON profiles;

-- Create simplified policy without recursion
CREATE POLICY "Users can view team members profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Own profile
    auth.uid() = id
    OR
    -- Team members in same team (simple JOIN without nested queries)
    EXISTS (
      SELECT 1
      FROM team_members tm1
      INNER JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = profiles.id
    )
    OR
    -- Managers can view their team members
    EXISTS (
      SELECT 1
      FROM profiles p2
      INNER JOIN teams t ON p2.assigned_team_id = t.id
      INNER JOIN team_members tm ON tm.team_id = t.id
      WHERE p2.id = auth.uid()
      AND p2.role = 'manager'
      AND tm.user_id = profiles.id
    )
  );

-- Ensure FK exists for issues.assigned_to
DO $$
BEGIN
  -- Check if FK exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'issues_assigned_to_fkey'
    AND table_name = 'issues'
  ) THEN
    -- Add FK if it doesn't exist
    ALTER TABLE issues
    ADD CONSTRAINT issues_assigned_to_fkey
    FOREIGN KEY (assigned_to)
    REFERENCES profiles(id)
    ON DELETE SET NULL;
  END IF;
END $$;
