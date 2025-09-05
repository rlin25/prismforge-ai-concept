import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const results = [];

    // List of table creation queries
    const tableQueries = [
      {
        name: 'organizations',
        query: `CREATE TABLE IF NOT EXISTS organizations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          domain TEXT,
          subscription_tier TEXT DEFAULT 'free',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'users',
        query: `CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'viewer',
          organization_id UUID REFERENCES organizations(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'chat_sessions',
        query: `CREATE TABLE IF NOT EXISTS chat_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          organization_id UUID REFERENCES organizations(id),
          session_type TEXT DEFAULT 'phase1_exploration',
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'document_processing',
        query: `CREATE TABLE IF NOT EXISTS document_processing (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES chat_sessions(id),
          file_name TEXT NOT NULL,
          file_type TEXT NOT NULL,
          file_size_bytes INTEGER,
          processing_status TEXT DEFAULT 'pending',
          extracted_data JSONB,
          document_summary TEXT,
          key_insights TEXT[],
          classification TEXT,
          token_usage INTEGER DEFAULT 0,
          organization_id UUID REFERENCES organizations(id),
          uploaded_by UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'teams',
        query: `CREATE TABLE IF NOT EXISTS teams (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          organization_id UUID REFERENCES organizations(id) NOT NULL,
          created_by UUID REFERENCES users(id),
          budget_limit_cents INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'team_memberships',
        query: `CREATE TABLE IF NOT EXISTS team_memberships (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          role TEXT DEFAULT 'member',
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          UNIQUE(team_id, user_id)
        )`
      },
      {
        name: 'usage_tracking',
        query: `CREATE TABLE IF NOT EXISTS usage_tracking (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          organization_id UUID REFERENCES organizations(id),
          user_id UUID REFERENCES users(id),
          session_id UUID REFERENCES chat_sessions(id),
          usage_type TEXT NOT NULL,
          cost_cents INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )`
      },
      {
        name: 'health_check',
        query: `CREATE TABLE IF NOT EXISTS health_check (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          status TEXT DEFAULT 'healthy',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW') NOT NULL
        )`
      }
    ];

    // Execute table creation queries using Supabase SQL function
    for (const table of tableQueries) {
      try {
        // Try using the supabase-js library's SQL method
        const { error } = await supabase.from('__').select('1').limit(0); // Test connection first
        
        // Since direct SQL execution is limited, let's create tables via individual operations
        // For now, just mark as attempted - user will need to run SQL manually
        results.push({ 
          table: table.name, 
          status: 'needs_manual_creation',
          query: table.query.substring(0, 100) + '...'
        });
      } catch (error: any) {
        results.push({ 
          table: table.name, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    // Try to insert test data using the ORM approach
    try {
      // Check if organizations table exists by trying to query it
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

      if (!orgError) {
        // Table exists, try to insert test data without domain field first
        const { error: insertOrgError } = await supabase
          .from('organizations')
          .upsert({
            id: '00000000-0000-0000-0000-000000000001',
            name: 'Test Organization',
            subscription_tier: 'enterprise'
          });

        if (!insertOrgError) {
          const { error: insertUserError } = await supabase
            .from('users')
            .upsert({
              id: '00000000-0000-0000-0000-000000000001',
              email: 'test@localhost',
              role: 'owner',
              organization_id: '00000000-0000-0000-0000-000000000001'
            });

          if (!insertUserError) {
            results.push({ table: 'test_data', status: 'inserted' });
          } else {
            results.push({ table: 'test_data', status: 'error', error: insertUserError.message });
          }
        } else {
          // If that fails, try with domain field
          const { error: insertOrgErrorWithDomain } = await supabase
            .from('organizations')
            .upsert({
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Test Organization',
              domain: 'localhost',
              subscription_tier: 'enterprise'
            });
          
          if (insertOrgErrorWithDomain) {
            results.push({ table: 'test_data', status: 'error', error: insertOrgError.message + '; ' + insertOrgErrorWithDomain.message });
          } else {
            results.push({ table: 'test_data', status: 'inserted' });
          }
        }
      } else {
        results.push({ table: 'test_data', status: 'skipped', error: 'Tables need to be created first' });
      }
    } catch (error: any) {
      results.push({ table: 'test_data', status: 'error', error: error.message });
    }

    return NextResponse.json({
      status: 'completed',
      results,
      message: 'Database setup process completed - some tables may need manual creation in Supabase dashboard',
      manual_sql_needed: true,
      sql_file_location: '/database-setup.sql'
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Try running the SQL commands manually in your Supabase dashboard'
    }, { status: 500 });
  }
}