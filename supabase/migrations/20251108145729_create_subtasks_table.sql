/*
  # Create subtasks table

  1. New Tables
    - `subtasks`
      - `id` (uuid, primary key) - Unique identifier for each subtask
      - `title` (text) - The subtask title/description
      - `task_id` (uuid, foreign key) - References tasks table (parent task)
      - `user_id` (uuid, foreign key) - References auth.users table
      - `is_saved` (boolean) - Whether user has saved/kept this subtask
      - `created_at` (timestamptz) - Timestamp when subtask was created

  2. Security
    - Enable RLS on `subtasks` table
    - Add policy for users to view their own subtasks
    - Add policy for users to insert their own subtasks
    - Add policy for users to update their own subtasks
    - Add policy for users to delete their own subtasks

  3. Important Notes
    - Subtasks are linked to both tasks and users
    - When a task is deleted, its subtasks are automatically deleted
    - Users can only access their own subtasks
*/

CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_saved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subtasks"
  ON subtasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subtasks"
  ON subtasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subtasks"
  ON subtasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subtasks"
  ON subtasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS subtasks_user_id_idx ON subtasks(user_id);
