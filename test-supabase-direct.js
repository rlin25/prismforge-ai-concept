#!/usr/bin/env node

// Test direct Supabase connection using their client library
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  // Load environment from .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔗 Connecting to Supabase with service role...');
  console.log('URL:', SUPABASE_URL);
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test basic query
    console.log('\n📊 Testing database query...');
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('Query error:', error);
    } else {
      console.log(`✅ Found ${data.length} organizations`);
      if (data.length > 0) {
        console.log('Sample organization:', data[0]);
      }
    }
    
    // List all tables
    console.log('\n📋 Available tables:');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables');
      
    if (tablesError) {
      // If RPC doesn't exist, try a different approach
      console.log('Using information_schema to list tables...');
      
      // For now, let's just test known tables
      const knownTables = ['organizations', 'users', 'analysis_sessions', 'teams', 'team_memberships'];
      
      for (const table of knownTables) {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: exists`);
        }
      }
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

// Install @supabase/supabase-js if not available
try {
  require('@supabase/supabase-js');
} catch (e) {
  console.log('Installing @supabase/supabase-js dependency...');
  require('child_process').execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

try {
  require('dotenv');
} catch (e) {
  console.log('Installing dotenv dependency...');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
}

testSupabaseConnection().catch(console.error);