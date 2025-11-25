/*
  # Update Properties RLS Policies

  1. Security Changes
    - Drop existing UPDATE and DELETE policies
    - Add new policies allowing all authenticated users to update and delete properties
  
  ## Details
  This migration updates the row-level security policies for the properties table
  to allow all authenticated users to edit and delete any property, not just their own.
  This enables collaborative property management across the team.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

-- Create new policies allowing all authenticated users
CREATE POLICY "Authenticated users can update properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (true);
