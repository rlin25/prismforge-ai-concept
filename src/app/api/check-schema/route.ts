import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const results = [];

    // Check organizations table structure
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);
      
      if (error) {
        results.push({ table: 'organizations', status: 'missing', error: error.message });
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : ['table_exists_but_no_data'];
        results.push({ table: 'organizations', status: 'exists', columns });
      }
    } catch (error: any) {
      results.push({ table: 'organizations', status: 'error', error: error.message });
    }

    // Check users table structure
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (error) {
        results.push({ table: 'users', status: 'missing', error: error.message });
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : ['table_exists_but_no_data'];
        results.push({ table: 'users', status: 'exists', columns });
      }
    } catch (error: any) {
      results.push({ table: 'users', status: 'error', error: error.message });
    }

    // Check document_processing table structure
    try {
      const { data, error } = await supabase
        .from('document_processing')
        .select('*')
        .limit(1);
      
      if (error) {
        results.push({ table: 'document_processing', status: 'missing', error: error.message });
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : ['table_exists_but_no_data'];
        results.push({ table: 'document_processing', status: 'exists', columns });
      }
    } catch (error: any) {
      results.push({ table: 'document_processing', status: 'error', error: error.message });
    }

    // Check chat_sessions table structure
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .limit(1);
      
      if (error) {
        results.push({ table: 'chat_sessions', status: 'missing', error: error.message });
      } else {
        const columns = data && data.length > 0 ? Object.keys(data[0]) : ['table_exists_but_no_data'];
        results.push({ table: 'chat_sessions', status: 'exists', columns });
      }
    } catch (error: any) {
      results.push({ table: 'chat_sessions', status: 'error', error: error.message });
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Schema check completed',
      results
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}