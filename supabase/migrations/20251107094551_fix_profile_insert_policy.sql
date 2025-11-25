/*
  # Fix Profile Insert Policy

  1. Changes
    - Drop existing insert policy for profiles
    - Create new insert policy that allows anyone to insert their own profile during registration
    - This enables new users to create their profile immediately after auth signup
  
  2. Security
    - Policy still checks that auth.uid() matches the profile id
    - Only allows users to create their own profile, not others
*/

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);
