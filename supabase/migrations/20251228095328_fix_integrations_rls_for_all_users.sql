/*
  # Fix Integrations RLS for All Users

  ## Description
  Simplifie et corrige les policies RLS pour la table integrations afin de permettre:
  - Les employés peuvent créer/gérer leurs intégrations personnelles (user_id = auth.uid(), team_id = NULL)
  - Les membres d'équipe peuvent voir les intégrations de leur équipe
  - Les managers peuvent créer/gérer les intégrations de leur équipe

  ## Changes
  1. Supprimer TOUTES les anciennes policies
  2. Créer 4 nouvelles policies claires pour SELECT, INSERT, UPDATE, DELETE
  
  ## Security
  - Employés: Accès complet à leurs intégrations personnelles
  - Membres: Lecture des intégrations de l'équipe
  - Managers: Gestion complète des intégrations de l'équipe
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can create own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON integrations;
DROP POLICY IF EXISTS "Managers can insert integrations" ON integrations;
DROP POLICY IF EXISTS "Managers can update integrations" ON integrations;
DROP POLICY IF EXISTS "Managers can delete integrations" ON integrations;
DROP POLICY IF EXISTS "Users can view team integrations" ON integrations;
DROP POLICY IF EXISTS "Managers can manage team integrations" ON integrations;
DROP POLICY IF EXISTS "Team members can view integrations" ON integrations;
DROP POLICY IF EXISTS "Team admins can manage integrations" ON integrations;

-- SELECT: Users can view their own personal integrations OR team integrations
CREATE POLICY "Allow SELECT integrations"
  ON integrations
  FOR SELECT
  TO authenticated
  USING (
    -- Personal integration
    (user_id = auth.uid() AND team_id IS NULL)
    OR
    -- Team integration (if user is member)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
    ))
  );

-- INSERT: Users can create personal integrations OR managers can create team integrations
CREATE POLICY "Allow INSERT integrations"
  ON integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Personal integration
    (user_id = auth.uid() AND team_id IS NULL)
    OR
    -- Team integration (if user is manager of that team)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    ))
    OR
    -- Team integration (if user is owner/admin)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    ))
  );

-- UPDATE: Users can update their own personal integrations OR managers can update team integrations
CREATE POLICY "Allow UPDATE integrations"
  ON integrations
  FOR UPDATE
  TO authenticated
  USING (
    -- Personal integration
    (user_id = auth.uid() AND team_id IS NULL)
    OR
    -- Team integration (if user is manager of that team)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    ))
    OR
    -- Team integration (if user is owner/admin)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    ))
  )
  WITH CHECK (
    -- Same as USING
    (user_id = auth.uid() AND team_id IS NULL)
    OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    ))
    OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    ))
  );

-- DELETE: Users can delete their own personal integrations OR managers can delete team integrations
CREATE POLICY "Allow DELETE integrations"
  ON integrations
  FOR DELETE
  TO authenticated
  USING (
    -- Personal integration
    (user_id = auth.uid() AND team_id IS NULL)
    OR
    -- Team integration (if user is manager of that team)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = integrations.team_id
    ))
    OR
    -- Team integration (if user is owner/admin)
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = integrations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    ))
  );
