-- Migration to fix anonymous finds submissions
-- Run this in your Supabase SQL Editor

-- Step 1: Make finder_id and user_id nullable
ALTER TABLE finds 
ALTER COLUMN finder_id DROP NOT NULL,
ALTER COLUMN user_id DROP NOT NULL;

-- Step 2: Add default values for required fields
ALTER TABLE finds 
ALTER COLUMN category SET DEFAULT 'other',
ALTER COLUMN status SET DEFAULT 'active';

-- Step 3: If item_description doesn't exist, add it (or rename description to item_description)
-- Check if item_description column exists, if not, add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'finds' AND column_name = 'item_description') THEN
        ALTER TABLE finds ADD COLUMN item_description TEXT;
    END IF;
END $$;

-- Step 4: Update existing records to have proper defaults
UPDATE finds 
SET 
    category = COALESCE(category, 'other'),
    status = COALESCE(status, 'active'),
    item_description = COALESCE(item_description, description, 'No description provided')
WHERE category IS NULL OR status IS NULL OR item_description IS NULL;

-- Step 5: Drop existing RLS policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON finds;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON finds;
DROP POLICY IF EXISTS "Allow public reads" ON finds;
DROP POLICY IF EXISTS "Allow owner updates" ON finds;
DROP POLICY IF EXISTS "Allow owner deletes" ON finds;
DROP POLICY IF EXISTS "Allow all inserts" ON finds;

-- Step 6: Create new RLS policies for anonymous submissions
-- Allow anyone to insert (including anonymous users)
CREATE POLICY "Allow anonymous and authenticated inserts" ON finds
  FOR INSERT WITH CHECK (true);

-- Allow public reads of active finds
CREATE POLICY "Allow public reads" ON finds
  FOR SELECT USING (status = 'active');

-- Allow updates only by the finder or if anonymous
CREATE POLICY "Allow finder updates" ON finds
  FOR UPDATE USING (
    finder_id = auth.uid() OR 
    user_id = auth.uid() OR
    auth.uid() IS NULL
  );

-- Allow deletes only by the finder or if anonymous
CREATE POLICY "Allow finder deletes" ON finds
  FOR DELETE USING (
    finder_id = auth.uid() OR 
    user_id = auth.uid() OR
    auth.uid() IS NULL
  );

-- Step 7: Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    column_default,
    data_type
FROM information_schema.columns 
WHERE table_name = 'finds' 
AND column_name IN ('finder_id', 'user_id', 'category', 'status', 'item_description')
ORDER BY column_name;

-- Step 8: Test the policies
SELECT 'Migration completed successfully! Anonymous submissions should now work.' as status;
