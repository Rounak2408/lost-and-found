# Fixed: Lost Item Report Submission

## **Problem Solved:**
Your "Failed to submit loss report" error was caused by a mismatch between your database schema and frontend code. Your database uses UUIDs and references `auth.users`, but the frontend was using integer IDs and a custom users table.

## **What I Fixed:**

### **1. Updated Database Function (`lib/database/finds-losses.ts`)**
- Changed `user_id` from `number` to `string` (UUID)
- Updated `CreateLossData` interface to match your schema
- Removed `owner_name` field (not in your schema)
- Added `category` and `reward_amount` fields
- Changed `contact_info` to accept JSON object

### **2. Updated Loss Form (`app/dashboard/loss/page.tsx`)**
- Now uses Supabase Auth instead of localStorage
- Gets user UUID from `supabase.auth.getUser()`
- Sends data in correct format for your schema
- Handles `contact_info` as JSON object

## **Exact API Payload for Your Schema:**

### **POST Request to Supabase:**
```javascript
const payload = {
  user_id: "550e8400-e29b-41d4-a716-446655440000", // UUID from Supabase Auth
  item_name: "bag",
  description: "marwadi university with blue waterbottle",
  category: "Personal Items", // Optional
  location_lost: "mb201",
  date_lost: "2025-06-09", // YYYY-MM-DD format
  reward_amount: 0, // Optional, defaults to 0
  contact_info: { // JSON object
    phone: "8294341139",
    email: "user@example.com"
  }
}
```

### **How to Get Current User's UUID:**
```javascript
import { supabase } from '@/lib/supabase/client'

// Get current user
const { data: { user }, error } = await supabase.auth.getUser()

if (user) {
  const userId = user.id // This is the UUID you need
  console.log('User UUID:', userId)
}
```

## **Field Mapping:**

| Form Field | Database Column | Type | Required | Example |
|------------|----------------|------|----------|---------|
| Item Name | `item_name` | TEXT | ✅ Yes | "bag" |
| Description | `description` | TEXT | ❌ Optional | "marwadi university with blue waterbottle" |
| Category | `category` | TEXT | ❌ Optional | "Personal Items" |
| Location Lost | `location_lost` | TEXT | ❌ Optional | "mb201" |
| Date Lost | `date_lost` | DATE | ❌ Optional | "2025-06-09" |
| Reward Amount | `reward_amount` | NUMERIC | ❌ Optional | 0 |
| Contact Info | `contact_info` | JSONB | ❌ Optional | `{"phone": "8294341139", "email": "user@example.com"}` |

## **Contact Info JSON Format:**
```javascript
// Option 1: With phone and email
contact_info: {
  phone: "8294341139",
  email: "user@example.com"
}

// Option 2: Just phone
contact_info: {
  phone: "8294341139"
}

// Option 3: Just email
contact_info: {
  email: "user@example.com"
}

// Option 4: Leave as null (optional field)
contact_info: null
```

## **Complete Example Request:**
```javascript
const { data, error } = await supabase
  .from('losses')
  .insert([{
    user_id: "550e8400-e29b-41d4-a716-446655440000", // From auth.getUser()
    item_name: "bag",
    description: "marwadi university with blue waterbottle",
    category: "Personal Items",
    location_lost: "mb201",
    date_lost: "2025-06-09",
    reward_amount: 0,
    contact_info: {
      phone: "8294341139",
      email: "rounak@example.com"
    }
  }])
  .select()
  .single()
```

## **Testing Steps:**
1. **Login with Supabase Auth** - Make sure you're authenticated
2. **Fill out the form** with your data:
   - Item Name: "bag"
   - Description: "marwadi university with blue waterbottle"
   - Category: "Personal Items" (optional)
   - Location Lost: "mb201"
   - Date Lost: "09/06/2025"
   - Reward Amount: 0 (optional)
   - Contact Info: "8294341139"
3. **Click Submit** - Should now work without errors
4. **Check database** - Record should be inserted successfully

## **Expected Result:**
- ✅ **Success dialog**: "Lost Item Reported!"
- ✅ **Database record**: Inserted into `losses` table
- ✅ **Community notification**: Sent to all users
- ✅ **No more errors**: Form submission works perfectly

The key was using the correct UUID from Supabase Auth and matching the exact schema structure of your database table!

