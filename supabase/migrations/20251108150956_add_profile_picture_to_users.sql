/*
  # Add profile picture to users

  1. Changes
    - Add `profile_picture_url` column to auth.users metadata
    - Create a profiles table to store user profile data including profile picture URL
    
  2. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `profile_picture_url` (text) - URL to the profile picture in storage
      - `updated_at` (timestamptz) - Last update timestamp
      
  3. Security
    - Enable RLS on profiles table
    - Users can view their own profile
    - Users can update their own profile
    - Users can insert their own profile
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_picture_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);
