// Microsoft SSO Callback Handler
import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseSSOManager } from '@/lib/enterprise/sso-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const storedState = request.cookies.get('oauth_state')?.value;
    const error = searchParams.get('error');
    
    if (error) {
      console.error('Microsoft SSO error:', error, searchParams.get('error_description'));
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=microsoft_${error}`);
    }
    
    if (!code || !stateParam) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=missing_parameters`);
    }
    
    // Validate state parameter
    let organizationHint, tenant;
    try {
      const parsedState = JSON.parse(stateParam);
      if (parsedState.state !== storedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=invalid_state`);
      }
      organizationHint = parsedState.organizationHint;
      tenant = parsedState.tenant;
    } catch {
      // Handle simple state parameter
      if (stateParam !== storedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=invalid_state`);
      }
    }
    
    // Exchange code for tokens
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenant || 'common'}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`,
        grant_type: 'authorization_code',
        scope: 'openid profile email User.Read'
      })
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Microsoft token exchange failed: ${tokens.error}`);
    }
    
    // Get user profile from Microsoft Graph
    const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    
    const profile = await profileResponse.json();
    
    // Get user's groups for role mapping (optional)
    let groups = [];
    try {
      const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        groups = groupsData.value;
      }
    } catch (error) {
      console.warn('Could not fetch user groups:', error);
    }
    
    // Handle enterprise SSO provisioning
    const ssoManager = new EnterpriseSSOManager();
    const result = await ssoManager.handleSSOCallback('microsoft', {
      profile,
      groups,
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
    console.error('Microsoft SSO callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=microsoft_callback_failed`);
  }
}