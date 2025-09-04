// Google OAuth Callback Handler
import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseSSOManager } from '@/lib/enterprise/sso-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const storedState = request.cookies.get('oauth_state')?.value;
    
    if (!code || !stateParam) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=missing_parameters`);
    }
    
    // Validate state parameter
    let organizationHint;
    try {
      const parsedState = JSON.parse(stateParam);
      if (parsedState.state !== storedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=invalid_state`);
      }
      organizationHint = parsedState.organizationHint;
    } catch {
      // Handle simple state parameter
      if (stateParam !== storedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=invalid_state`);
      }
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokens.error}`);
    }
    
    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const profile = await profileResponse.json();
    
    // Handle enterprise SSO provisioning
    const ssoManager = new EnterpriseSSOManager();
    const result = await ssoManager.handleSSOCallback('google', {
      profile,
      tokens
    }, organizationHint);
    
    if (result.success && result.session) {
      // Set secure session cookie
      const response = NextResponse.redirect(result.redirectUrl);
      response.cookies.set('session_token', result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: result.session.expiresIn,
        path: '/'
      });
      
      // Clear OAuth state
      response.cookies.delete('oauth_state');
      
      return response;
    } else {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=${encodeURIComponent(result.error || 'SSO provisioning failed')}`);
    }
    
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=oauth_callback_failed`);
  }
}