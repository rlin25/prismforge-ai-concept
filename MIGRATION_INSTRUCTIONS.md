# Phase 2 Database Migration Instructions

## Current Issue
You're seeing this error: `ERROR: 42703: column "analysis_session_id" does not exist`

This means the Phase 2 database tables haven't been created yet.

## Solution Steps

### Option 1: Minimal Migration (Recommended)
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy the contents of `supabase/migrations/003_phase2_minimal.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Complete Safe Migration
1. Open your Supabase Dashboard  
2. Go to SQL Editor
3. Copy the contents of `supabase/migrations/003_phase2_agents_safe.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

## After Migration
Once the migration runs successfully:
1. Refresh your application (it should continue working)
2. The Phase 2 Professional Validation feature will be fully functional
3. You can test the $500 professional multi-agent validation

## Verification
After running the migration, you can verify it worked by checking in Supabase Dashboard > Table Editor:
- analysis_sessions table should exist
- agent_executions table should exist
- quality_validations table should exist
- agent_status_updates table should exist
- professional_deliverables table should exist

## If You Still Get Errors
1. Check the Supabase logs in the Dashboard
2. Make sure you're connected to the right project
3. Verify you have the correct database URL in your .env.local file