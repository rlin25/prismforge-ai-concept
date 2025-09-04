// Google OAuth Integration for PrismForge AI Enterprise
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationHint = searchParams.get('org');
    
    // Generate secure state parameter
    const state = crypto.randomUUID();
    
    // Store state in session/database for validation
    const response = NextResponse.redirect(
      `https://accounts.google.com/oauth/authorize?${new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        scope: 'openid profile email',
        response_type: 'code',
        state: JSON.stringify({ state, organizationHint }),
        access_type: 'offline',
        prompt: 'consent'
      })}`
    );
    
    // Store state in secure cookie for validation
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    });
    
    return response;
    
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=oauth_init_failed`);
  }
}