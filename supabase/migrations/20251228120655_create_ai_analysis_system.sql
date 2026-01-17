/*
  # Create AI Analysis System for Tool Problems Detection

  1. New Tables
    - `tool_problems`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `integration_id` (uuid, references integrations)
      - `tool_name` (text)
      - `problem_type` (text: friction, performance, cost, security, workflow)
      - `severity` (text: low, medium, high, critical)
      - `title` (text)
      - `description` (text)
      - `ai_recommendation` (text)
      - `detected_at` (timestamptz)
      - `status` (text: detected, acknowledged, in_progress, solved)
      - `solved_at` (timestamptz, nullable)
      - `metadata` (jsonb)
    
    - `ai_analysis_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `integration_id` (uuid, references integrations)
      - `analysis_type` (text)
      - `prompt` (text)
      - `response` (text)
      - `tokens_used` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only view and manage their own problems and logs
*/

CREATE TABLE IF NOT EXISTS tool_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  tool_name text NOT NULL,
  problem_type text NOT NULL CHECK (problem_type IN ('friction', 'performance', 'cost', 'security', 'workflow')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text NOT NULL,
  ai_recommendation text,
  detected_at timestamptz DEFAULT now() NOT NULL,
  status text DEFAULT 'detected' NOT NULL CHECK (status IN ('detected', 'acknowledged', 'in_progress', 'solved')),
  solved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  integration_id uuid REFERENCES integrations(id) ON DELETE CASCADE,
  analysis_type text NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE tool_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tool problems"
  ON tool_problems
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tool problems"
  ON tool_problems
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tool problems"
  ON tool_problems
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tool problems"
  ON tool_problems
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI logs"
  ON ai_analysis_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI logs"
  ON ai_analysis_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tool_problems_user_id ON tool_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_problems_status ON tool_problems(status);
CREATE INDEX IF NOT EXISTS idx_tool_problems_severity ON tool_problems(severity);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_user_id ON ai_analysis_logs(user_id);
