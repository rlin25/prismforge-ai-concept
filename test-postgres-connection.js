#!/usr/bin/env node

// Test PostgreSQL connection to Supabase with proper password
const { Client } = require('pg');

async function testConnection() {
  // Load environment from .env.local
  require('dotenv').config({ path: '.env.local' });
  
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;
  
  // Parse Supabase URL to get project reference
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
  
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to Supabase PostgreSQL with database password...');
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
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('organizations', 'users', 'analysis_sessions', 'teams', 'team_memberships')
      ORDER BY table_name
    `);
    
    if (prismforgeTables.rows.length > 0) {
      for (const row of prismforgeTables.rows) {
        console.log(`  ✅ ${row.table_name} (${row.column_count} columns)`);
        
        // Get row count for each table
        try {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
          console.log(`      📊 ${countResult.rows[0].count} rows`);
        } catch (e) {
          console.log(`      ❌ Could not count rows: ${e.message}`);
        }
      }
    } else {
      console.log('  ⚠️  No PrismForge AI tables found');
    }
    
    console.log('\n🎉 PostgreSQL connection test successful!');
    console.log('🚀 MCP server should now be able to connect to Supabase');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔚 Connection closed');
  }
}

testConnection().catch(console.error);