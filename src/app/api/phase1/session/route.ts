// API Route for Phase 1 Session Management
// PrismForge AI - Professional M&A Validation Platform

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, title } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // For testing purposes, create or get a default test user and organization
    let { data: testOrg, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', 'Test Organization')
      .single();

    if (!testOrg) {
      const { data: newOrg, error: createOrgError } = await supabase
        .from('organizations')
        .insert([{
          name: 'Test Organization',
          plan_type: 'individual'
        }])
        .select()
        .single();

      if (createOrgError) {
        console.error('Error creating test organization:', createOrgError);
        return NextResponse.json(
          { error: 'Failed to create test organization' },
          { status: 500 }
        );
      }
      testOrg = newOrg;
    }

    // Create or get default test user
    let { data: testUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'test@example.com')
      .single();

    if (!testUser) {
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          email: 'test@example.com',
          organization_id: testOrg.id,
          auth_provider: 'email',
          full_name: 'Test User'
        }])
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating test user:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create test user' },
          { status: 500 }
        );
      }
      testUser = newUser;
    }

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (existingSession) {
      return NextResponse.json({ 
        sessionId,
        message: 'Session already exists',
        initialized: true 
      });
    }

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert([{
        id: sessionId,
        user_id: testUser.id,
        organization_id: testOrg.id,
        title: title || 'Phase 1 Test Session',
        phase: '1',
        token_usage: 0,
        cost_cents: 0,
        transition_readiness: false
      }])
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId,
      message: 'Session initialized successfully',
      initialized: true,
      session
    });

  } catch (error) {
    console.error('Session initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}