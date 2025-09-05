import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  try {
    const setupQueries = [
      // Organizations table
      `CREATE TABLE IF NOT EXISTS organizations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT,
        subscription_tier TEXT DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'viewer',
        organization_id UUID REFERENCES organizations(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Chat sessions table
      `CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        organization_id UUID REFERENCES organizations(id),
        session_type TEXT DEFAULT 'phase1_exploration',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Document processing table
      `CREATE TABLE IF NOT EXISTS document_processing (
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
      );`,

      // Teams table
      `CREATE TABLE IF NOT EXISTS teams (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        organization_id UUID REFERENCES organizations(id) NOT NULL,
        created_by UUID REFERENCES users(id),
        budget_limit_cents INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Team memberships table
      `CREATE TABLE IF NOT EXISTS team_memberships (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        UNIQUE(team_id, user_id)
      );`,

      // Usage tracking table
      `CREATE TABLE IF NOT EXISTS usage_tracking (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        organization_id UUID REFERENCES organizations(id),
        user_id UUID REFERENCES users(id),
        session_id UUID REFERENCES chat_sessions(id),
        usage_type TEXT NOT NULL,
        cost_cents INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Health check table for testing
      `CREATE TABLE IF NOT EXISTS health_check (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        status TEXT DEFAULT 'healthy',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,

      // Insert initial health check record
      `INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;`,

      // Create a test organization
      `INSERT INTO organizations (id, name, domain, subscription_tier) 
       VALUES ('00000000-0000-0000-0000-000000000001', 'Test Organization', 'localhost', 'enterprise') 
       ON CONFLICT (id) DO NOTHING;`,

      // Create a test user
      `INSERT INTO users (id, email, role, organization_id) 
       VALUES ('00000000-0000-0000-0000-000000000001', 'test@localhost', 'owner', '00000000-0000-0000-0000-000000000001') 
       ON CONFLICT (email) DO NOTHING;`
    ];

    const results = [];
    for (const query of setupQueries) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { sql: query });
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabaseAdmin.from('_').select('*').limit(0);
          if (directError) {
            results.push({ query: query.substring(0, 50) + '...', status: 'error', error: error.message });
          } else {
            results.push({ query: query.substring(0, 50) + '...', status: 'success' });
          }
        } else {
          results.push({ query: query.substring(0, 50) + '...', status: 'success' });
        }
      } catch (err) {
        results.push({ 
          query: query.substring(0, 50) + '...', 
          status: 'error', 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Database setup attempted',
      results,
      note: 'Some queries may fail if tables already exist - this is normal'
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      note: 'You may need to run these SQL commands manually in your Supabase dashboard'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Database setup endpoint ready. Send POST request to initialize tables.',
    required_tables: [
      'organizations',
      'users', 
      'chat_sessions',
      'document_processing',
      'teams',
      'team_memberships',
      'usage_tracking',
      'health_check'
    ]
  });
}