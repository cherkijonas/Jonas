/*
  # Update profiles RLS to allow users to update their own profile

  ## Problem
  Users cannot update their own profile information, including their role.

  ## Solution
  Add policies to allow users to:
  - View their own profile
  - Update their own profile (including role change)

  ## Security Note
  Allowing users to change their own role is intentional for this application.
  In a production environment, role changes should be controlled by admins only.

  ## Changes
  - Add SELECT policy for users to view their own profile
  - Add UPDATE policy for users to update their own profile
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
