import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test database connection and check if tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 });
    }

    // Check for specific tables we need
    const tableNames = tables?.map(t => t.table_name) || [];
    const requiredTables = ['chat_sessions', 'document_processing', 'organizations'];
    const missingTables = requiredTables.filter(table => !tableNames.includes(table));

    return NextResponse.json({
      status: 'success',
      database_connected: true,
      all_tables: tableNames,
      required_tables: requiredTables,
      missing_tables: missingTables
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}