/*
  # Fix Team Join Requests RLS for Managers

  ## Description
  Corrige les policies RLS pour que les managers puissent voir TOUTES les demandes d'adhésion
  de leur équipe assignée via assigned_team_id.

  ## Changes
  1. Drop et recréer la policy SELECT pour les managers
  2. Permettre aux managers de voir les demandes basées sur leur assigned_team_id
  3. Simplifier la logique pour éviter les problèmes de récursion

  ## Security
  - Les managers peuvent voir uniquement les demandes pour leur équipe assignée
  - Les employés peuvent voir uniquement leurs propres demandes
*/

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Managers can view team join requests" ON team_join_requests;
DROP POLICY IF EXISTS "Users can view own join requests" ON team_join_requests;
DROP POLICY IF EXISTS "Team members can view join requests" ON team_join_requests;

-- Users can view their own join requests
CREATE POLICY "Users can view own join requests"
  ON team_join_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Managers can view join requests for their assigned team
CREATE POLICY "Managers can view team join requests"
  ON team_join_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = team_join_requests.team_id
      AND profiles.assigned_team_id IS NOT NULL
    )
  );

-- Drop and recreate UPDATE policy for managers
DROP POLICY IF EXISTS "Managers can update team join requests" ON team_join_requests;

CREATE POLICY "Managers can update team join requests"
  ON team_join_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
      AND profiles.assigned_team_id = team_join_requests.team_id
      AND profiles.assigned_team_id IS NOT NULL
    )
  );
