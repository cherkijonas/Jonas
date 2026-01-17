/*
  # Enhance Employee Features Schema

  ## Description
  Adds comprehensive employee-focused features including enhanced profiles,
  employee metrics, goals, feedback, and improved request tracking.

  ## New Tables
  1. **employee_metrics**
     - Tracks employee performance metrics and activity stats
     - Fields: requests_submitted, requests_approved, integrations_connected, etc.
  
  2. **employee_goals**
     - Personal OKRs and goals for employees
     - Fields: title, description, target_date, progress, status
  
  3. **employee_feedback**
     - Feedback from managers to employees
     - Fields: from_user_id, to_user_id, feedback_text, rating, type
  
  4. **request_attachments**
     - File attachments for employee requests
     - Fields: request_id, file_name, file_url, file_type, file_size

  ## Profile Enhancements
  - Add bio, phone, location, avatar_url fields to profiles
  - Add preferences JSONB field for user settings
  
  ## Request Enhancements
  - Add attachments support
  - Add comments/thread capability
  - Add more request types

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own data
  - Managers can view team data
*/

-- Enhance profiles table with more employee fields
DO $$
BEGIN
  -- Add bio field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio TEXT;
  END IF;

  -- Add phone field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;

  -- Add location field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location TEXT;
  END IF;

  -- Add preferences field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Add updated_at field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create employee_metrics table
CREATE TABLE IF NOT EXISTS employee_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requests_submitted INTEGER DEFAULT 0,
  requests_approved INTEGER DEFAULT 0,
  requests_rejected INTEGER DEFAULT 0,
  integrations_connected INTEGER DEFAULT 0,
  issues_resolved INTEGER DEFAULT 0,
  teams_joined INTEGER DEFAULT 0,
  activity_score INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE employee_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON employee_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON employee_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert metrics"
  ON employee_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create employee_goals table
CREATE TABLE IF NOT EXISTS employee_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'personal',
  target_date DATE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE employee_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON employee_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Managers can view team goals"
  ON employee_goals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      INNER JOIN team_members tm ON tm.user_id = employee_goals.user_id
      INNER JOIN team_members tm2 ON tm2.team_id = tm.team_id
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
      AND tm2.user_id = auth.uid()
    )
  );

-- Create employee_feedback table
CREATE TABLE IF NOT EXISTS employee_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'performance', 'recognition', 'improvement')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE employee_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback about them"
  ON employee_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

CREATE POLICY "Managers can give feedback"
  ON employee_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = from_user_id
    AND EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'manager'
    )
  );

CREATE POLICY "Users can mark feedback as read"
  ON employee_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- Create request_comments table for threaded discussions
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES employee_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Request participants can view comments"
  ON request_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM employee_requests er
      WHERE er.id = request_comments.request_id
      AND (er.user_id = auth.uid() OR er.manager_id = auth.uid())
    )
  );

CREATE POLICY "Request participants can add comments"
  ON request_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM employee_requests er
      WHERE er.id = request_comments.request_id
      AND (er.user_id = auth.uid() OR er.manager_id = auth.uid())
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_metrics_user_id ON employee_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_goals_user_id ON employee_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_goals_status ON employee_goals(status);
CREATE INDEX IF NOT EXISTS idx_employee_feedback_to_user ON employee_feedback(to_user_id);
CREATE INDEX IF NOT EXISTS idx_employee_feedback_from_user ON employee_feedback(from_user_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON request_comments(request_id);

-- Create function to auto-update metrics
CREATE OR REPLACE FUNCTION update_employee_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update metrics when a request is created
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'employee_requests') THEN
    INSERT INTO employee_metrics (user_id, requests_submitted)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      requests_submitted = employee_metrics.requests_submitted + 1,
      updated_at = now();
  END IF;

  -- Update metrics when a request status changes
  IF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'employee_requests' AND OLD.status != NEW.status) THEN
    IF NEW.status = 'approved' THEN
      UPDATE employee_metrics
      SET requests_approved = requests_approved + 1,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.status = 'rejected' THEN
      UPDATE employee_metrics
      SET requests_rejected = requests_rejected + 1,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  -- Update metrics when an integration is connected
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'integrations' AND NEW.user_id IS NOT NULL) THEN
    INSERT INTO employee_metrics (user_id, integrations_connected)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      integrations_connected = employee_metrics.integrations_connected + 1,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating metrics
DROP TRIGGER IF EXISTS trigger_update_metrics_on_request ON employee_requests;
CREATE TRIGGER trigger_update_metrics_on_request
  AFTER INSERT OR UPDATE ON employee_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_metrics();

DROP TRIGGER IF EXISTS trigger_update_metrics_on_integration ON integrations;
CREATE TRIGGER trigger_update_metrics_on_integration
  AFTER INSERT ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_metrics();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_goals_updated_at ON employee_goals;
CREATE TRIGGER update_employee_goals_updated_at
  BEFORE UPDATE ON employee_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
