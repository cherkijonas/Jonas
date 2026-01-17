/*
  # Allow Anonymous Users to Read Company Codes

  1. Changes
    - Add RLS policy to allow anonymous (unauthenticated) users to read company codes
    - This is needed because users need to verify company codes BEFORE logging in
  
  2. Security
    - Only SELECT access is granted to anonymous users
    - No INSERT/UPDATE/DELETE permissions for anonymous users
    - Company codes are not sensitive information that needs to be hidden from unauthenticated users
*/

-- Drop existing policy and recreate with both anonymous and authenticated access
DROP POLICY IF EXISTS "Authenticated users can view company codes" ON company_codes;

CREATE POLICY "Anyone can view company codes"
  ON company_codes
  FOR SELECT
  TO anon, authenticated
  USING (true);