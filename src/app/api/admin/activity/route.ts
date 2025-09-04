// Admin Activity API
// Provides recent activity logs for organization administrators

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

    // Get parameters
    const { searchParams } = new URL(request.url);
    const requestedOrgId = searchParams.get('orgId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (requestedOrgId !== organizationId) {
      return NextResponse.json(
        { error: 'Access denied: Organization mismatch' },
        { status: 403 }
      );
    }

    // Check permissions
    const canViewAudit = await permissionManager.checkPermission(
      userId,
      'audit.view'
    );

    if (!canViewAudit) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get recent audit logs with user information
    const { data: auditLogs, error } = await supabase
      .from('audit_logs')
      .select(`
        id,
        action,
        resource_type,
        resource_id,
        details,
        created_at,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }

    // Format activity data
    const activity = (auditLogs || []).map((log: any) => ({
      id: log.id,
      action: formatAction(log.action, log.resource_type),
      user: log.users?.full_name || log.users?.email || 'System',
      timestamp: log.created_at,
      resourceType: log.resource_type,
      details: log.details
    }));

    return NextResponse.json(activity);

  } catch (error) {
    console.error('Admin activity error:', error);
    return NextResponse.json(
      { error: 'Failed to load activity' },
      { status: 500 }
    );
  }
}

// Helper function to format audit actions into human-readable text
function formatAction(action: string, resourceType: string): string {
  const actionMap: Record<string, string> = {
    'user_created': 'created a new user account',
    'user_updated': 'updated user information',
    'user_deleted': 'deleted a user account',
    'role_assigned': 'assigned a new role',
    'team_created': 'created a new team',
    'team_updated': 'updated team settings',
    'team_deleted': 'deleted a team',
    'team_member_added': 'added a team member',
    'team_member_removed': 'removed a team member',
    'analysis_created': 'created a new analysis',
    'analysis_shared': 'shared an analysis',
    'analysis_completed': 'completed an analysis',
    'session_created': 'logged in',
    'session_destroyed': 'logged out',
    'sso_login': 'logged in via SSO',
    'password_changed': 'changed their password',
    'permission_granted': 'granted permissions',
    'permission_revoked': 'revoked permissions',
    'billing_updated': 'updated billing information',
    'organization_updated': 'updated organization settings'
  };

  return actionMap[action] || `performed ${action} on ${resourceType}`;
}