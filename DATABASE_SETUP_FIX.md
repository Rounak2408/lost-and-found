# Database Setup Required - Lost Item Report Error Fix

## **Issue Identified:**
The "Failed to submit loss report" error occurs because the database tables haven't been created yet.

## **Root Cause:**
The `createLoss` function tries to insert into the `losses` table, but this table doesn't exist in your Supabase database.

## **Solution:**

### **Step 1: Run Database Setup Scripts**
Execute these SQL scripts in your Supabase SQL Editor in this order:

1. **Users Table** (if not already done):
```sql
-- Run: database/users_table.sql
```

2. **Finds and Losses Tables**:
```sql
-- Run: database/finds_losses_schema.sql
```

3. **Notifications Table** (for community notifications):
```sql
-- Run: database/notifications_schema.sql
```

4. **Storage Buckets** (for images):
```sql
-- Run: database/storage_setup.sql
-- Run: database/find_images_storage.sql
```

### **Step 2: Verify Tables Exist**
After running the scripts, verify these tables exist in Supabase:
- `users`
- `finds` 
- `losses`
- `notifications`

### **Step 3: Test the Form**
1. Go to `/dashboard/loss`
2. Fill out the form with test data
3. Submit the form
4. Should now work without errors

## **Quick Fix - Run This SQL:**

If you want to quickly create just the losses table:

```sql
-- Create losses table for items that users have lost
CREATE TABLE IF NOT EXISTS losses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_description TEXT NOT NULL,
  location_lost TEXT NOT NULL,
  date_lost DATE NOT NULL,
  owner_name TEXT NOT NULL,
  contact_info TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_losses_user_id ON losses(user_id);
CREATE INDEX IF NOT EXISTS idx_losses_status ON losses(status);
CREATE INDEX IF NOT EXISTS idx_losses_location ON losses(location_lost);
CREATE INDEX IF NOT EXISTS idx_losses_date ON losses(date_lost);
```

## **Expected Result:**
After running the database setup, the lost item form should work perfectly and you'll see:
- ✅ Success dialog: "Lost Item Reported!"
- ✅ Notification sent to all users
- ✅ Data saved in database

The error occurs because the application is trying to insert data into a table that doesn't exist yet. Once you run the database setup scripts, everything will work as expected!
