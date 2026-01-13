/*
  # Allow Personal Integrations for Employees

  ## Description
  Permet aux employés de connecter des outils même sans faire partie d'une équipe.
  Les intégrations peuvent maintenant être liées soit à une équipe (team_id) soit à un utilisateur (user_id).

  ## Changes
  1. Rendre team_id nullable dans integrations
  2. Ajouter user_id dans integrations
  3. Ajouter contrainte CHECK pour s'assurer qu'au moins team_id ou user_id est défini
  4. Mettre à jour les RLS policies

  ## Security
  - Les employés peuvent voir/gérer uniquement leurs propres intégrations personnelles
  - Les managers peuvent voir/gérer les intégrations de leur équipe
*/

-- Add user_id column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'integrations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE integrations 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make team_id nullable
ALTER TABLE integrations 
ALTER COLUMN team_id DROP NOT NULL;

-- Add constraint to ensure at least one ID is set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'integrations_team_or_user_check'
  ) THEN
    ALTER TABLE integrations 
    ADD CONSTRAINT integrations_team_or_user_check 
    CHECK (team_id IS NOT NULL OR user_id IS NOT NULL);
  END IF;
END $$;

-- Add unique constraint for user personal integrations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'integrations_user_tool_unique'
  ) THEN
    CREATE UNIQUE INDEX integrations_user_tool_unique 
    ON integrations (user_id, tool_name) 
    WHERE user_id IS NOT NULL AND team_id IS NULL;
  END IF;
END $$;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view team integrations" ON integrations;
DROP POLICY IF EXISTS "Managers can manage team integrations" ON integrations;
DROP POLICY IF EXISTS "Team members can view integrations" ON integrations;
DROP POLICY IF EXISTS "Team admins can manage integrations" ON integrations;

-- Allow users to view their own personal integrations
CREATE POLICY "Users can view own integrations"
  ON integrations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Allow users to insert their own personal integrations
CREATE POLICY "Users can create own integrations"
  ON integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Allow users to update their own personal integrations
CREATE POLICY "Users can update own integrations"
  ON integrations
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Allow users to delete their own personal integrations
CREATE POLICY "Users can delete own integrations"
  ON integrations
  FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );
