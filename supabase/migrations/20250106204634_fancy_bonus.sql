/*
  # Initial Schema Setup for AI Journal

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `audio_url` (text, nullable)
      - `transcription` (text, nullable)
      - `mood` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `entry_tags`
      - `id` (uuid, primary key)
      - `entry_id` (uuid, references journal_entries)
      - `tag` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text,
  audio_url text,
  transcription text,
  mood text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create entry_tags table
CREATE TABLE IF NOT EXISTS entry_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES journal_entries ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own entry tags"
  ON entry_tags FOR ALL
  TO authenticated
  USING (
    entry_id IN (
      SELECT id FROM journal_entries WHERE user_id = auth.uid()
    )
  );
