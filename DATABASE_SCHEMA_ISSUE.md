# Database Schema Issue Resolution

## 🚨 Current Problem
The database tables exist in your Supabase project but are missing required columns. This suggests they were created with a basic schema rather than the full enterprise schema.

## ❌ Missing Columns Detected
- `organizations` table: Missing `domain`, `subscription_tier` columns
- `chat_sessions` table: Missing `session_type` column  
- Likely other tables have similar column mismatches

## ✅ Solution Steps

### Option 1: Drop and Recreate (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/hshmedkrowhzsyngmruc)
2. Navigate to **SQL Editor**
3. Run this command to drop existing tables:
```sql
DROP TABLE IF EXISTS document_processing CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS team_memberships CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS usage_tracking CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS health_check CASCADE;
```
4. Copy and paste the complete contents from `database-setup.sql`
5. Click **Run** to create tables with correct schema

### Option 2: Add Missing Columns (Advanced)
If you have existing data to preserve, add missing columns manually:
```sql
-- Add missing columns to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Add missing columns to chat_sessions  
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'phase1_exploration',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Continue for other tables as needed...
```

## 🔍 Current Status
- ✅ Supabase connection working
- ✅ All API endpoints implemented
- ✅ Frontend pages working
- ❌ Database schema incomplete
- ❌ Document upload will fail until schema is fixed

## 🧪 Test After Fix
Once you've updated the database schema, test document upload at:
http://localhost:3000/phase1

The system should work fully once the database schema matches the application expectations.