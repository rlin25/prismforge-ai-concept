// Test API to create a session for Phase 1 testing
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // For testing, create a dummy organization and user
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Organization',
        domain: 'localhost',
        subscription_tier: 'enterprise',
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { error: 'Failed to create test organization' },
        { status: 500 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@localhost',
        organization_id: org.id,
        role: 'owner',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create test user' },
        { status: 500 }
      );
    }

    // Create a test session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        session_type: 'phase1_exploration',
        status: 'active',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create test session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      organizationId: org.id,
      userId: user.id,
    });

  } catch (error) {
    console.error('Test session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create test session' },
      { status: 500 }
    );
  }
}