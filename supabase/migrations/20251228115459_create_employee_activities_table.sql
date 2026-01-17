/*
  # Create Employee Activities Table

  1. Purpose
    - Track employee successes, achievements, milestones, and productivity wins
    - Enable success feed display on employee dashboard
    - Support AI-driven activity detection

  2. New Tables
    - `employee_activities`
      - `id` (uuid, primary key) - Unique activity identifier
      - `user_id` (uuid, foreign key) - References auth.users(id)
      - `activity_type` (text) - Type: achievement, milestone, streak, productivity
      - `title` (text) - Short success title (e.g., "5 tickets resolved")
      - `description` (text) - Detailed description with context
      - `metadata` (jsonb) - Flexible storage for tool_name, metrics, comparisons
      - `icon` (text) - Icon identifier for UI display
      - `color` (text) - Hex color for visual theming
      - `created_at` (timestamptz) - When the activity occurred
      - `updated_at` (timestamptz) - Last modification timestamp

  3. Security
    - Enable RLS on `employee_activities` table
    - Employees can view their own activities only
    - Employees can create activities (for manual logging)
    - Managers can view activities of their team members
    - System can create activities via service role

  4. Indexes
    - Index on `user_id` for fast lookups
    - Index on `created_at` for chronological sorting
    - Index on `activity_type` for filtering

  5. Use Cases
    - Display success feed on employee dashboard
    - Track productivity trends over time
    - Generate motivation through visible wins
    - Support AI-driven achievement detection
*/

CREATE TABLE IF NOT EXISTS employee_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('achievement', 'milestone', 'streak', 'productivity')),
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  icon text NOT NULL DEFAULT 'Sparkles',
  color text NOT NULL DEFAULT '#00FF88',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employee_activities_user_id ON employee_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_activities_created_at ON employee_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employee_activities_type ON employee_activities(activity_type);

ALTER TABLE employee_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own activities"
  ON employee_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Employees can create own activities"
  ON employee_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can delete own activities"
  ON employee_activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view team activities"
  ON employee_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS manager_profile
      WHERE manager_profile.id = auth.uid()
      AND manager_profile.role = 'manager'
      AND EXISTS (
        SELECT 1 FROM team_members AS tm
        JOIN profiles AS employee_profile ON employee_profile.id = employee_activities.user_id
        WHERE tm.team_id = manager_profile.assigned_team_id
        AND tm.user_id = employee_activities.user_id
      )
    )
  );

CREATE OR REPLACE FUNCTION update_employee_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employee_activities_updated_at
  BEFORE UPDATE ON employee_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_activities_updated_at();

COMMENT ON TABLE employee_activities IS 'Tracks employee successes, achievements, and productivity wins for motivation and analytics';
COMMENT ON COLUMN employee_activities.activity_type IS 'Type of activity: achievement (completed task), milestone (significant event), streak (consistency), productivity (efficiency gain)';
COMMENT ON COLUMN employee_activities.metadata IS 'Flexible JSON storage for tool_name, metric_value, metric_unit, comparison, and other context';
COMMENT ON COLUMN employee_activities.icon IS 'Icon identifier matching lucide-react icons for UI display';
COMMENT ON COLUMN employee_activities.color IS 'Hex color code for visual theming and categorization';
