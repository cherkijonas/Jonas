/*
  # Add Company Codes and Team Transfer Requests

  ## New Tables
  
  1. `company_codes`
    - `id` (uuid, primary key)
    - `code` (text, unique) - Le code unique de l'entreprise
    - `company_name` (text) - Nom de l'entreprise
    - `created_at` (timestamptz)
    - `created_by` (uuid) - Référence au créateur
    
  2. `team_transfer_requests`
    - `id` (uuid, primary key)
    - `user_id` (uuid) - L'employé qui demande le transfert
    - `from_team_id` (uuid, nullable) - L'équipe actuelle
    - `to_team_id` (uuid) - L'équipe souhaitée
    - `message` (text) - Motivation de la demande
    - `status` (text) - pending, approved, rejected
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `reviewed_by` (uuid, nullable) - Manager qui a traité la demande
    - `reviewed_at` (timestamptz, nullable)

  ## Changes to Existing Tables
  
  - Add `company_code` to `profiles` table to link users to their company

  ## Security
  
  - Enable RLS on all new tables
  - Company codes: Only authenticated users can view
  - Transfer requests: Users can view their own, managers can view all for their teams
*/

-- Create company_codes table
CREATE TABLE IF NOT EXISTS company_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE company_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view company codes"
  ON company_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only system can insert company codes"
  ON company_codes FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Add company_code to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_code text;
  END IF;
END $$;

-- Create team_transfer_requests table
CREATE TABLE IF NOT EXISTS team_transfer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  to_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz
);

ALTER TABLE team_transfer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfer requests"
  ON team_transfer_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfer requests"
  ON team_transfer_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view transfer requests for their teams"
  ON team_transfer_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_transfer_requests.to_team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Managers can update transfer requests for their teams"
  ON team_transfer_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_transfer_requests.to_team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_transfer_requests.to_team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Insert a default company code for testing
INSERT INTO company_codes (code, company_name, created_by)
VALUES ('FLUX2024', 'Flux.AI Demo Company', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (code) DO NOTHING;
