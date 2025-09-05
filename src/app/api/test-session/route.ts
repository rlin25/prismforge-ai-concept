import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Create a test session for document upload testing
    const testSession = {
      user_id: 'test-user-id',
      organization_id: 'test-org-id',
      session_type: 'phase1_exploration',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert([testSession])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      session_id: session.id,
      message: 'Test session created successfully'
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get recent test sessions
    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', 'test-user-id')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ 
        status: 'error', 
        message: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      sessions: sessions || []
    });

  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}