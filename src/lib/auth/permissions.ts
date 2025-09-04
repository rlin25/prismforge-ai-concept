// Role-Based Access Control (RBAC) System
// PrismForge AI - Enterprise Permission Management

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Enterprise Role Definitions
export interface EnterpriseRoles {
  owner: {
    permissions: [
      "organization.manage",
      "billing.manage", 
      "users.manage",
      "sso.configure",
      "analyses.create",
      "analyses.view_all",
      "analyses.share_external"
    ];
    analysisApprovalLimit: "unlimited";
  };
  
  admin: {
    permissions: [
      "users.manage",
      "teams.manage",
      "analyses.view_all",
      "analyses.approve",
      "templates.manage",
      "reports.generate"
    ];
    analysisApprovalLimitCents: 250000; // $2,500
  };
  
  manager: {
    permissions: [
      "team.manage",
      "analyses.create",
      "analyses.view_team",
      "analyses.approve_team",
      "cost_center.view"
    ];
    analysisApprovalLimitCents: 100000; // $1,000
  };
  
  analyst: {
    permissions: [
      "analyses.create",
      "analyses.view_own",
      "analyses.view_shared",
      "templates.use",
      "collaboration.participate"
    ];
    analysisApprovalLimitCents: 50000; // $500
  };
  
  viewer: {
    permissions: [
      "analyses.view_shared",
      "reports.view",
      "collaboration.comment"
    ];
    analysisApprovalLimitCents: 0;
  };
}

// Permission Manager Class
export class PermissionManager {
  private supabase = supabase;
  
  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      // Decode JWT token (simplified - use proper JWT library in production)
      const payload = this.decodeJWT(token);
      
      if (!payload || payload.expiresAt < Date.now()) {
        return { valid: false, reason: 'Token expired' };
      }
      
      // Verify session in database
      const { data: session } = await this.supabase
        .from('user_sessions')
        .select('*, users(*)')
        .eq('id', payload.sessionId)
        .eq('revoked_at', null)
        .gte('expires_at', new Date().toISOString())
        .single();
      
      if (!session) {
        return { valid: false, reason: 'Session not found or expired' };
      }
      
      // Update last activity
      await this.supabase
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', session.id);
      
      return {
        valid: true,
        user: session.users,
        session
      };
      
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, reason: 'Invalid token' };
    }
  }
  
  async checkPermission(
    userId: string,
    permission: string,
    resourceContext?: ResourceContext
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithPermissions(userId);
      
      if (!user) {
        return false;
      }
      
      // Check direct role permissions
      const rolePermissions = this.getRolePermissions(user.role);
      if (rolePermissions.includes(permission)) {
        return true;
      }
      
      // Check team-based permissions
      if (resourceContext?.teamId) {
        const teamRole = await this.getUserTeamRole(userId, resourceContext.teamId);
        if (teamRole === 'lead' && this.isTeamPermission(permission)) {
          return true;
        }
      }
      
      // Check resource ownership
      if (resourceContext?.resourceOwnerId === userId) {
        if (this.isOwnershipPermission(permission)) {
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }
  
  async checkAnalysisApprovalLimit(
    userId: string,
    analysisAmountCents: number
  ): Promise<boolean> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role, analysis_approval_limit_cents, organizations(*)')
        .eq('id', userId)
        .single();
      
      if (!user) {
        return false;
      }
      
      // Check if user can approve this analysis amount
      if (user.role === 'owner' || user.analysis_approval_limit_cents >= analysisAmountCents) {
        return true;
      }
      
      // Organization check would be done separately
      
      return false;
      
    } catch (error) {
      console.error('Approval limit check error:', error);
      return false;
    }
  }
  
  private async getUserWithPermissions(userId: string) {
    const { data: user } = await this.supabase
      .from('users')
      .select('*, organizations(*)')
      .eq('id', userId)
      .single();
    
    return user;
  }
  
  private async getUserTeamRole(userId: string, teamId: string): Promise<string | null> {
    const { data: membership } = await this.supabase
      .from('team_memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .single();
    
    return membership?.role || null;
  }
  
  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      owner: [
        "organization.manage",
        "billing.manage", 
        "users.manage",
        "sso.configure",
        "analyses.create",
        "analyses.view_all",
        "analyses.share_external",
        "analyses.approve"
      ],
      admin: [
        "users.manage",
        "teams.manage",
        "analyses.view_all",
        "analyses.approve",
        "templates.manage",
        "reports.generate"
      ],
      manager: [
        "team.manage",
        "analyses.create",
        "analyses.view_team",
        "analyses.approve_team",
        "cost_center.view"
      ],
      analyst: [
        "analyses.create",
        "analyses.view_own",
        "analyses.view_shared",
        "templates.use",
        "collaboration.participate"
      ],
      viewer: [
        "analyses.view_shared",
        "reports.view",
        "collaboration.comment"
      ]
    };
    
    return permissions[role] || [];
  }
  
  private isTeamPermission(permission: string): boolean {
    const teamPermissions = [
      "analyses.view_team",
      "analyses.approve_team",
      "team.manage"
    ];
    return teamPermissions.includes(permission);
  }
  
  private isOwnershipPermission(permission: string): boolean {
    const ownershipPermissions = [
      "analyses.view_own",
      "analyses.edit_own",
      "analyses.share_own"
    ];
    return ownershipPermissions.includes(permission);
  }
  
  private decodeJWT(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}

// Types
interface SessionValidationResult {
  valid: boolean;
  reason?: string;
  user?: any;
  session?: any;
}

interface ResourceContext {
  teamId?: string;
  resourceOwnerId?: string;
  resourceId?: string;
}

export default PermissionManager;