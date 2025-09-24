-- Updated finds table schema to support anonymous submissions
-- Run this in your Supabase SQL Editor

-- Drop existing table if it exists (be careful in production!)
-- DROP TABLE IF EXISTS finds CASCADE;

-- Create the updated finds table
CREATE TABLE IF NOT EXISTS finds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User identification (nullable for anonymous submissions)
  finder_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Required item information
  item_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  location_found TEXT NOT NULL,
  date_found DATE NOT NULL,
  
  -- Optional fields
  images JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  
  -- Status and matching
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
  matched_loss_id UUID REFERENCES losses(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_finds_finder_id ON finds(finder_id);
CREATE INDEX IF NOT EXISTS idx_finds_user_id ON finds(user_id);
CREATE INDEX IF NOT EXISTS idx_finds_status ON finds(status);
CREATE INDEX IF NOT EXISTS idx_finds_location ON finds(location_found);
CREATE INDEX IF NOT EXISTS idx_finds_date ON finds(date_found);
CREATE INDEX IF NOT EXISTS idx_finds_category ON finds(category);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_finds_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_finds_updated_at ON finds;
CREATE TRIGGER update_finds_updated_at
  BEFORE UPDATE ON finds
  FOR EACH ROW
  EXECUTE FUNCTION update_finds_updated_at_column();

-- Enable RLS
ALTER TABLE finds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON finds;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON finds;
DROP POLICY IF EXISTS "Allow public reads" ON finds;
DROP POLICY IF EXISTS "Allow owner updates" ON finds;
DROP POLICY IF EXISTS "Allow owner deletes" ON finds;

-- Create permissive policies for anonymous submissions
CREATE POLICY "Allow anonymous inserts" ON finds
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated inserts" ON finds
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow public reads" ON finds
  FOR SELECT USING (status = 'active');

CREATE POLICY "Allow owner updates" ON finds
  FOR UPDATE USING (
    finder_id = auth.uid() OR 
    user_id = auth.uid() OR
    auth.uid() IS NULL
  );

CREATE POLICY "Allow owner deletes" ON finds
  FOR DELETE USING (
    finder_id = auth.uid() OR 
    user_id = auth.uid() OR
    auth.uid() IS NULL
  );

-- Verify the table was created
SELECT 'finds table created successfully with anonymous support!' as status;
