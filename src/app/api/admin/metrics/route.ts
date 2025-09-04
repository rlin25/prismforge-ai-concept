// Admin Metrics API
// Provides dashboard metrics for organization administrators

import { NextRequest, NextResponse } from 'next/server';
import { permissionManager } from '@/lib/enterprise/permission-manager';
import { enterpriseSessionManager } from '@/lib/enterprise/session-manager';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session
    const sessionResult = await enterpriseSessionManager.validateSession(sessionToken);
    
    if (!sessionResult.valid || !sessionResult.user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = sessionResult.user.id;
    const organizationId = sessionResult.user.organization_id;

    // Get organization ID from query params
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get('orgId');

    if (requestedOrgId !== organizationId) {
      return NextResponse.json(
        { error: 'Access denied: Organization mismatch' },
        { status: 403 }
      );
    }

    // Check permissions
    const canViewMetrics = await permissionManager.checkPermission(
      userId,
      'reports.generate'
    );

    if (!canViewMetrics) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total users
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, last_login')
      .eq('organization_id', organizationId);

    if (usersError) {
      throw new Error(`Failed to get users: ${usersError.message}`);
    }

    const totalUsers = allUsers?.length || 0;
    const activeUsers = allUsers?.filter(user => {
      if (!user.last_login) return false;
      const lastLogin = new Date(user.last_login);
      return lastLogin >= startOfMonth && lastLogin <= endOfMonth;
    }).length || 0;

    // Get total teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
      .eq('organization_id', organizationId);

    if (teamsError) {
      throw new Error(`Failed to get teams: ${teamsError.message}`);
    }

    const totalTeams = teams?.length || 0;

    // Get monthly analyses
    const { data: analyses, error: analysesError } = await supabase
      .from('analysis_sessions')
      .select('id')
      .eq('organization_id', organizationId)
      .gte('created_at', startOfMonth.toISOString())
      .lte('created_at', endOfMonth.toISOString());

    if (analysesError) {
      throw new Error(`Failed to get analyses: ${analysesError.message}`);
    }

    const monthlyAnalyses = analyses?.length || 0;
    const monthlyCostCents = monthlyAnalyses * 50000; // $500 per analysis

    // Get active sessions
    const sessionMetrics = await enterpriseSessionManager.getSessionMetrics(organizationId);

    // Check SSO status
    const { data: organization } = await supabase
      .from('organizations')
      .select('sso_configuration')
      .eq('id', organizationId)
      .single();

    const ssoEnabled = !!(organization?.sso_configuration && 
      Object.keys(organization.sso_configuration).length > 0);

    const metrics = {
      totalUsers,
      activeUsers,
      totalTeams,
      monthlyAnalyses,
      monthlyCostCents,
      activeSessions: sessionMetrics.active_sessions,
      pendingInvites: 0, // Would need separate tracking
      ssoEnabled
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to load metrics' },
      { status: 500 }
    );
  }
}