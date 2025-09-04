// Microsoft SSO Integration for PrismForge AI Enterprise
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationHint = searchParams.get('org');
    const tenantHint = searchParams.get('tenant');
    
    // Generate secure state parameter
    const state = crypto.randomUUID();
    
    // Determine tenant endpoint
    const tenant = tenantHint || 'common'; // 'common' allows any Microsoft tenant
    
    const response = NextResponse.redirect(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/microsoft/callback`,
        scope: 'openid profile email User.Read',
        response_type: 'code',
        state: JSON.stringify({ state, organizationHint, tenant }),
        response_mode: 'query'
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
    console.error('Microsoft SSO initiation error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/error?error=microsoft_init_failed`);
  }
}