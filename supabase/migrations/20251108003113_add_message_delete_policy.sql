/*
  # Add message delete policy

  1. Security Changes
    - Add DELETE policy for messages table
    - Allow users to delete their own sent messages

  ## Details
  This migration adds a row-level security policy that allows authenticated users
  to delete messages where they are the sender. This enables users to remove
  messages they have sent from the conversation history.
*/

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);
