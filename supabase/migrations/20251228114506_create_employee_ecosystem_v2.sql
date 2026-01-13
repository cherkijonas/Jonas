/*
  # Employee Ecosystem V2 Schema

  ## Overview
  Creates comprehensive schema for the rebuilt Employee section including:
  - Connected tools tracking
  - Health score calculation
  - Friction detection and management
  - Enhanced employee metrics

  ## Changes

  1. Profiles Table Updates
    - Add `connected_tools` (jsonb array) - stores list of connected integration IDs
    - Add `health_score` (integer 0-100) - real-time calculated health metric
    - Add `last_activity_at` (timestamp) - tracks last user interaction

  2. New Table: `frictions`
    - Tracks individual workflow bottlenecks and issues
    - Links to user_id and tool_name
    - Supports severity levels and resolution tracking
    - Categories: pending_validation, stalled_pr, ghost_file, deep_work_low, etc.

  3. Security
    - Enable RLS on frictions table
    - Users can view their own frictions
    - Managers can view team member frictions
    - Users can update their own friction status

  ## Notes
  - Health score starts at 0 and increases as tools are connected
  - Frictions are detected by AI analysis of tool metadata
  - All changes preserve existing data
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'connected_tools'
  ) THEN
    ALTER TABLE profiles ADD COLUMN connected_tools jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'health_score'
  ) THEN
    ALTER TABLE profiles ADD COLUMN health_score integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create frictions table
CREATE TABLE IF NOT EXISTS frictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  friction_type text NOT NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_frictions_user_id ON frictions(user_id);
CREATE INDEX IF NOT EXISTS idx_frictions_tool_name ON frictions(tool_name);
CREATE INDEX IF NOT EXISTS idx_frictions_is_resolved ON frictions(is_resolved);
CREATE INDEX IF NOT EXISTS idx_frictions_severity ON frictions(severity);
CREATE INDEX IF NOT EXISTS idx_profiles_health_score ON profiles(health_score);
CREATE INDEX IF NOT EXISTS idx_profiles_connected_tools ON profiles USING gin(connected_tools);

-- Enable RLS on frictions table
ALTER TABLE frictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for frictions table

-- Users can view their own frictions
CREATE POLICY "Users can view own frictions"
  ON frictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Managers can view team member frictions
CREATE POLICY "Managers can view team frictions"
  ON frictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM team_members tm1
      INNER JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = frictions.user_id
      AND tm1.role IN ('owner', 'admin')
    )
  );

-- Users can insert their own frictions
CREATE POLICY "Users can create own frictions"
  ON frictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own frictions
CREATE POLICY "Users can update own frictions"
  ON frictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own frictions
CREATE POLICY "Users can delete own frictions"
  ON frictions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update health score based on connected tools
CREATE OR REPLACE FUNCTION calculate_health_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_connected_count integer;
  v_total_possible integer := 33;
  v_unresolved_frictions integer;
  v_base_score integer;
  v_friction_penalty integer;
BEGIN
  -- Count connected tools
  SELECT jsonb_array_length(COALESCE(connected_tools, '[]'::jsonb))
  INTO v_connected_count
  FROM profiles
  WHERE id = p_user_id;

  -- Count unresolved frictions
  SELECT COUNT(*)
  INTO v_unresolved_frictions
  FROM frictions
  WHERE user_id = p_user_id AND is_resolved = false;

  -- Calculate base score (0-100 based on connected tools)
  IF v_connected_count = 0 THEN
    v_base_score := 0;
  ELSIF v_connected_count = 1 THEN
    v_base_score := 50;
  ELSE
    v_base_score := LEAST(100, 50 + ((v_connected_count - 1) * 5));
  END IF;

  -- Apply friction penalty (each unresolved friction reduces score)
  v_friction_penalty := v_unresolved_frictions * 3;
  
  RETURN GREATEST(0, LEAST(100, v_base_score - v_friction_penalty));
END;
$$;

-- Function to automatically update health score when tools change
CREATE OR REPLACE FUNCTION update_health_score_on_tools_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.health_score := calculate_health_score(NEW.id);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Trigger to update health score when connected_tools changes
DROP TRIGGER IF EXISTS trigger_update_health_score ON profiles;
CREATE TRIGGER trigger_update_health_score
  BEFORE UPDATE OF connected_tools ON profiles
  FOR EACH ROW
  WHEN (OLD.connected_tools IS DISTINCT FROM NEW.connected_tools)
  EXECUTE FUNCTION update_health_score_on_tools_change();

-- Function to update health score when frictions change
CREATE OR REPLACE FUNCTION update_health_score_on_friction_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET health_score = calculate_health_score(COALESCE(NEW.user_id, OLD.user_id)),
      updated_at = now()
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger to update health score when frictions change
DROP TRIGGER IF EXISTS trigger_update_health_score_on_friction ON frictions;
CREATE TRIGGER trigger_update_health_score_on_friction
  AFTER INSERT OR UPDATE OR DELETE ON frictions
  FOR EACH ROW
  EXECUTE FUNCTION update_health_score_on_friction_change();
