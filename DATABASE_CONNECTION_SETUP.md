# Database Setup Guide - Connect Forms to Real Database

## 🚨 **Current Issue:**
Forms are submitting successfully but data is only stored in localStorage (mock database), not in your real database.

## ✅ **Solution: Set Up Supabase Database Connection**

### **Step 1: Create Supabase Project**

1. **Go to** [supabase.com](https://supabase.com)
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Choose your organization**
5. **Enter project details:**
   - Name: `smart-loss-found`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
6. **Click "Create new project"**
7. **Wait for project to be ready** (2-3 minutes)

### **Step 2: Get Your Supabase Credentials**

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API"** in the left menu
3. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon/public key** (long string starting with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### **Step 3: Create Environment File**

1. **In your project root**, create a file called `.env.local`
2. **Add these lines:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Replace** `your-project-id` and the long key with your actual values
4. **Save the file**

### **Step 4: Set Up Database Tables**

1. **In Supabase Dashboard**, go to **SQL Editor**
2. **Click "New Query"**
3. **Copy and paste** the contents of `database/users_table.sql`
4. **Click "Run"** to create the users table
5. **Copy and paste** the contents of `database/finds_losses_schema.sql`
6. **Click "Run"** to create finds and losses tables

### **Step 5: Test the Connection**

1. **Restart your development server:**
   ```bash
   npm run dev
   ```
2. **Go to** `http://localhost:3000/database-test`
3. **Click "Test Database Connection"**
4. **Should show:** ✅ Connected to Supabase

### **Step 6: Test Form Submission**

1. **Go to** `http://localhost:3000/dashboard/find`
2. **Fill out and submit** the form
3. **Go to Supabase Dashboard** → **Table Editor** → **finds**
4. **You should see your submitted data!**

---

## 🔧 **Alternative: Quick Test with Existing Data**

If you want to test immediately without setting up Supabase:

1. **Open browser Developer Tools** (F12)
2. **Go to Application tab** → **Local Storage**
3. **Look for keys:** `mockFinds`, `mockLosses`, `mockNotifications`
4. **Your form data is stored there!**

---

## 📋 **Database Schema Overview**

### **Users Table:**
- `id` (Primary Key)
- `first_name`, `last_name`
- `email` (Unique)
- `phone`, `password_hash`
- `is_active`, `created_at`, `updated_at`

### **Finds Table:**
- `id` (Primary Key)
- `user_id` (References users.id)
- `item_name`, `item_description`
- `location_found`, `date_found`
- `image_url`, `contact_info`
- `status`, `created_at`, `updated_at`

### **Losses Table:**
- `id` (Primary Key)
- `user_id` (References users.id)
- `item_name`, `item_description`
- `location_lost`, `date_lost`
- `owner_name`, `contact_info`
- `status`, `created_at`, `updated_at`

---

## ✅ **After Setup:**

- ✅ **Forms will submit to real database**
- ✅ **Data persists permanently**
- ✅ **Multiple users can see each other's items**
- ✅ **Search functionality will work with real data**
- ✅ **Notifications will be sent to all users**

The mock system will automatically be disabled once Supabase is configured!
