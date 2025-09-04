#!/usr/bin/env node

// Test MCP connection to Supabase
const { Client } = require('pg');

async function testConnection() {
  // Load environment from .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Parse Supabase URL to get project reference
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: SERVICE_ROLE_KEY,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic query
    console.log('\n📊 Testing database query...');
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database:', result.rows[0].current_database);
    console.log('User:', result.rows[0].current_user);
    console.log('Version:', result.rows[0].version.substring(0, 50) + '...');
    
    // List tables in the public schema
    console.log('\n📋 Tables in public schema:');
    const tables = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name} (${row.table_type})`);
      });
    } else {
      console.log('  No tables found in public schema');
    }
    
    // Test PrismForge specific tables
    console.log('\n🏢 PrismForge AI tables:');
    const prismforgeTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'users', 'analysis_sessions', 'teams', 'team_memberships')
      ORDER BY table_name
    `);
    
    if (prismforgeTables.rows.length > 0) {
      prismforgeTables.rows.forEach(row => {
        console.log(`  ✅ ${row.table_name}`);
      });
    } else {
      console.log('  ⚠️  No PrismForge AI tables found');
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔚 Connection closed');
  }
}

// Install pg if not available
try {
  require('pg');
} catch (e) {
  console.log('Installing pg dependency...');
  require('child_process').execSync('npm install pg', { stdio: 'inherit' });
}

try {
  require('dotenv');
} catch (e) {
  console.log('Installing dotenv dependency...');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
}

testConnection().catch(console.error);