import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Basic connectivity test
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Missing Supabase configuration',
        config: {
          url: supabaseUrl ? 'Set' : 'Missing',
          anon_key: supabaseKey ? 'Set' : 'Missing',
          service_key: serviceKey ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test basic connection with anon key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try a simple query to test auth
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Supabase auth test failed',
        error: error.message,
        config: {
          url: supabaseUrl,
          key_length: supabaseKey.length
        }
      }, { status: 500 });
    }

    // Test service role connection
    const adminClient = createClient(supabaseUrl, serviceKey || '');
    const { data: healthCheck, error: healthError } = await adminClient
      .from('health_check')
      .select('*')
      .limit(1);

    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection successful',
      config: {
        url: supabaseUrl,
        anon_key_length: supabaseKey.length,
        service_key_length: serviceKey?.length || 0
      },
      auth_test: 'passed',
      health_check: healthError ? 'failed' : 'passed',
      health_error: healthError?.message
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      type: 'connection_test'
    }, { status: 500 });
  }
}