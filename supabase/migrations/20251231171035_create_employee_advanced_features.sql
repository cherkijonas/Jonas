/*
  # Employee Advanced Features Schema

  1. New Tables
    - `employee_time_tracking` - Track time spent on activities
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `tool_name` (text)
      - `activity_type` (text) - 'focus', 'meeting', 'communication', 'break'
      - `duration_minutes` (integer)
      - `energy_level` (integer) - 1-5 scale
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `created_at` (timestamptz)

    - `employee_quick_wins` - Quick tasks and achievements
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `estimated_minutes` (integer)
      - `status` (text) - 'pending', 'completed', 'skipped'
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `employee_automations` - No-code workflow automations
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text)
      - `trigger_type` (text)
      - `trigger_config` (jsonb)
      - `actions` (jsonb)
      - `is_active` (boolean)
      - `run_count` (integer)
      - `last_run_at` (timestamptz)
      - `created_at` (timestamptz)

    - `employee_focus_sessions` - Focus mode tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `duration_minutes` (integer)
      - `actual_duration_minutes` (integer)
      - `interruptions_count` (integer)
      - `quality_score` (integer) - 1-10
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz)
      - `created_at` (timestamptz)

    - `employee_knowledge_base` - Personal knowledge management
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - 'note', 'snippet', 'bookmark'
      - `title` (text)
      - `content` (text)
      - `tags` (text[])
      - `is_public` (boolean)
      - `language` (text) - for code snippets
      - `url` (text) - for bookmarks
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `employee_wellness_checkins` - Daily wellness tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date)
      - `mood_score` (integer) - 1-5
      - `stress_level` (integer) - 1-5
      - `energy_level` (integer) - 1-5
      - `work_hours` (decimal)
      - `breaks_taken` (integer)
      - `notes` (text)
      - `created_at` (timestamptz)

    - `employee_skills` - Skills tracking and growth
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `skill_name` (text)
      - `category` (text)
      - `proficiency_level` (integer) - 1-5
      - `experience_points` (integer)
      - `tools_used` (text[])
      - `last_used_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `employee_notifications` - Unified notification center
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `source_tool` (text)
      - `type` (text)
      - `title` (text)
      - `content` (text)
      - `priority` (text) - 'low', 'medium', 'high', 'urgent'
      - `is_read` (boolean)
      - `is_archived` (boolean)
      - `snoozed_until` (timestamptz)
      - `action_url` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `employee_collaboration_status` - Real-time team availability
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `status` (text) - 'available', 'focus', 'busy', 'meeting', 'away'
      - `current_task` (text)
      - `available_for_help` (boolean)
      - `context_message` (text)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for team members to view collaboration status
*/

-- Employee Time Tracking
CREATE TABLE IF NOT EXISTS employee_time_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_name text NOT NULL,
  activity_type text NOT NULL,
  duration_minutes integer NOT NULL,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own time tracking"
  ON employee_time_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time tracking"
  ON employee_time_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time tracking"
  ON employee_time_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own time tracking"
  ON employee_time_tracking FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Quick Wins
CREATE TABLE IF NOT EXISTS employee_quick_wins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  estimated_minutes integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_quick_wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quick wins"
  ON employee_quick_wins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick wins"
  ON employee_quick_wins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick wins"
  ON employee_quick_wins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick wins"
  ON employee_quick_wins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Automations
CREATE TABLE IF NOT EXISTS employee_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  trigger_type text NOT NULL,
  trigger_config jsonb DEFAULT '{}'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  run_count integer DEFAULT 0,
  last_run_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own automations"
  ON employee_automations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automations"
  ON employee_automations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations"
  ON employee_automations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations"
  ON employee_automations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Focus Sessions
CREATE TABLE IF NOT EXISTS employee_focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL,
  actual_duration_minutes integer,
  interruptions_count integer DEFAULT 0,
  quality_score integer CHECK (quality_score >= 1 AND quality_score <= 10),
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own focus sessions"
  ON employee_focus_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
  ON employee_focus_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON employee_focus_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own focus sessions"
  ON employee_focus_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Knowledge Base
CREATE TABLE IF NOT EXISTS employee_knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('note', 'snippet', 'bookmark')),
  title text NOT NULL,
  content text,
  tags text[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  language text,
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE employee_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knowledge items"
  ON employee_knowledge_base FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public knowledge items"
  ON employee_knowledge_base FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can insert own knowledge items"
  ON employee_knowledge_base FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge items"
  ON employee_knowledge_base FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge items"
  ON employee_knowledge_base FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Wellness Check-ins
CREATE TABLE IF NOT EXISTS employee_wellness_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 5),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 5),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 5),
  work_hours decimal,
  breaks_taken integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE employee_wellness_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wellness checkins"
  ON employee_wellness_checkins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wellness checkins"
  ON employee_wellness_checkins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wellness checkins"
  ON employee_wellness_checkins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wellness checkins"
  ON employee_wellness_checkins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Skills
CREATE TABLE IF NOT EXISTS employee_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  category text,
  proficiency_level integer DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  experience_points integer DEFAULT 0,
  tools_used text[] DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON employee_skills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON employee_skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON employee_skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
  ON employee_skills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Notifications
CREATE TABLE IF NOT EXISTS employee_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source_tool text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  snoozed_until timestamptz,
  action_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE employee_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON employee_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON employee_notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON employee_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON employee_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Employee Collaboration Status
CREATE TABLE IF NOT EXISTS employee_collaboration_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'focus', 'busy', 'meeting', 'away')),
  current_task text,
  available_for_help boolean DEFAULT true,
  context_message text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE employee_collaboration_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own collaboration status"
  ON employee_collaboration_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Team members can view collaboration status"
  ON employee_collaboration_status FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = auth.uid()
      AND tm2.user_id = employee_collaboration_status.user_id
    )
  );

CREATE POLICY "Users can insert own collaboration status"
  ON employee_collaboration_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collaboration status"
  ON employee_collaboration_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own collaboration status"
  ON employee_collaboration_status FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_tracking_user_date ON employee_time_tracking(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_quick_wins_user_status ON employee_quick_wins(user_id, status);
CREATE INDEX IF NOT EXISTS idx_automations_user_active ON employee_automations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_date ON employee_focus_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_user_type ON employee_knowledge_base(user_id, type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON employee_knowledge_base USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_wellness_checkins_user_date ON employee_wellness_checkins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_skills_user ON employee_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON employee_notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_collaboration_status_user ON employee_collaboration_status(user_id);
