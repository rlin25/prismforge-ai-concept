// Enterprise Permission Manager with Role-Based Access Control
// PrismForge AI - Professional M&A Validation Platform ($500 per professional validation)

import { supabase, supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

interface EnterpriseRBAC {
  roles: {
    owner: {
      permissions: string[];
      description: string;
      analysisApprovalLimit: string;
      analysisApprovalLimitCents: number;
    };
    admin: {
      permissions: string[];
      description: string;
      analysisApprovalLimitCents: number;
    };
    manager: {
      permissions: string[];
      description: string;
      analysisApprovalLimitCents: number;
    };
    analyst: {
      permissions: string[];
      description: string;
      analysisApprovalLimitCents: number;
    };
    viewer: {
      permissions: string[];
      description: string;
      analysisApprovalLimitCents: number;
    };
  };
}

interface User {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  analysis_approval_limit_cents: number;
  permissions?: string[];
}

interface ResourceContext {
  teamId?: string;
  resourceOwnerId?: string;
  resourceId?: string;
  organizationId?: string;
}

interface AuditLogEntry {
  userId: string;
  newRole: string;
  assignedBy: string;
  timestamp: Date;
}

export class PermissionManager {
  private readonly ANALYSIS_COST_CENTS = 50000; // $500 per professional validation
  
  // Enterprise RBAC configuration
  private readonly ENTERPRISE_RBAC: EnterpriseRBAC = {
    roles: {
      owner: {
        permissions: [
          "organization.manage",
          "billing.manage", 
          "users.manage",
          "sso.configure",
          "analyses.create",
          "analyses.view_all",
          "analyses.share_external",
          "teams.manage",
          "reports.generate",
          "audit.view"
        ],
        description: "Full organizational control",
        analysisApprovalLimit: "unlimited",
        analysisApprovalLimitCents: 0 // 0 means unlimited
      },
      
      admin: {
        permissions: [
          "users.manage",
          "teams.manage",
          "analyses.view_all",
          "analyses.approve",
          "templates.manage",
          "reports.generate",
          "analyses.create",
          "cost_center.view"
        ],
        description: "Administrative control within organization",
        analysisApprovalLimitCents: 250000 // $2,500 worth of analyses
      },
      
      manager: {
        permissions: [
          "team.manage",
          "analyses.create",
          "analyses.view_team",
          "analyses.approve_team",
          "cost_center.view",
          "analyses.share",
          "templates.use"
        ],
        description: "Team leadership and project management",
        analysisApprovalLimitCents: 100000 // $1,000 worth of analyses
      },
      
      analyst: {
        permissions: [
          "analyses.create",
          "analyses.view_own",
          "analyses.view_shared",
          "templates.use",
          "collaboration.participate",
          "analyses.share"
        ],
        description: "Standard analysis creation and collaboration",
        analysisApprovalLimitCents: 50000 // $500 (one professional validation)
      },
      
      viewer: {
        permissions: [
          "analyses.view_shared",
          "reports.view",
          "collaboration.comment"
        ],
        description: "Read-only access to shared content",
        analysisApprovalLimitCents: 0 // Cannot initiate analyses
      }
    }
  };

  /**
   * Check if user has specific permission
   */
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
      if (user.permissions && user.permissions.includes(permission)) {
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

  /**
   * Check if user can approve analysis with given cost
   */
  async checkAnalysisApprovalLimit(
    userId: string,
    analysisAmountCents: number
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithPermissions(userId);
      
      if (!user) {
        return false;
      }
      
      // Owners have unlimited approval (0 means unlimited)
      if (user.role === 'owner' || user.analysis_approval_limit_cents === 0) {
        return true;
      }
      
      // Check if user can approve this analysis amount
      if (user.analysis_approval_limit_cents >= analysisAmountCents) {
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('Approval limit check error:', error);
      return false;
    }
  }

  /**
   * Assign role to user with audit logging
   */
  async assignRole(
    userId: string,
    role: string,
    assignedBy: string
  ): Promise<void> {
    // Verify assigner has permission
    const canAssignRole = await this.checkPermission(assignedBy, 'users.manage');
    if (!canAssignRole) {
      throw new Error('Insufficient permissions to assign roles');
    }
    
    // Validate role exists
    if (!this.ENTERPRISE_RBAC.roles[role as keyof typeof this.ENTERPRISE_RBAC.roles]) {
      throw new Error(`Invalid role: ${role}`);
    }
    
    // Get current user for audit
    const currentUser = await this.getUserWithPermissions(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }
    
    // Update user role with standardized approval limits
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        role,
        analysis_approval_limit_cents: this.getApprovalLimitForRole(role),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }
    
    // Audit log
    await this.logRoleChange({
      userId,
      newRole: role,
      assignedBy,
      timestamp: new Date()
    });
    
    // Log audit event in enterprise audit log
    await this.logAuditEvent(
      currentUser.organization_id,
      assignedBy,
      'role_assigned',
      'user',
      userId,
      {
        oldRole: currentUser.role,
        newRole: role,
        targetUser: userId,
        approvalLimitChanged: true,
        newApprovalLimitCents: this.getApprovalLimitForRole(role)
      }
    );
  }

  /**
   * Get user permissions for role
   */
  getPermissionsForRole(role: string): string[] {
    const roleConfig = this.ENTERPRISE_RBAC.roles[role as keyof typeof this.ENTERPRISE_RBAC.roles];
    return roleConfig ? roleConfig.permissions : [];
  }

  /**
   * Get all available roles with descriptions
   */
  getAllRoles(): EnterpriseRBAC['roles'] {
    return this.ENTERPRISE_RBAC.roles;
  }

  /**
   * Check if user can access organization resource
   */
  async checkOrganizationAccess(userId: string, organizationId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();
      
      return user?.organization_id === organizationId;
    } catch (error) {
      console.error('Organization access check error:', error);
      return false;
    }
  }

  /**
   * Validate JWT session token
   */
  async validateSessionToken(token: string): Promise<{ valid: boolean; userId?: string; reason?: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Check if session exists and is active
      const { data: session } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', decoded.sessionId)
        .eq('user_id', decoded.userId)
        .single();
      
      if (!session) {
        return { valid: false, reason: 'Session not found' };
      }
      
      if (new Date(session.expires_at) < new Date()) {
        return { valid: false, reason: 'Session expired' };
      }
      
      // Update last activity
      await supabaseAdmin
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', session.id);
      
      return { valid: true, userId: decoded.userId };
      
    } catch (error) {
      console.error('Token validation error:', error);
      return { valid: false, reason: 'Invalid token' };
    }
  }

  /**
   * Get user with permissions populated
   */
  private async getUserWithPermissions(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          organizations (
            id,
            name,
            plan_type
          )
        `)
        .eq('id', userId)
        .single();
      
      if (error || !user) {
        return null;
      }
      
      // Add permissions based on role
      const permissions = this.getPermissionsForRole(user.role);
      
      return {
        ...user,
        permissions
      };
      
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Get user's team role
   */
  private async getUserTeamRole(userId: string, teamId: string): Promise<string | null> {
    try {
      const { data: membership } = await supabase
        .from('team_memberships')
        .select('role')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .single();
      
      return membership?.role || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if permission is team-related
   */
  private isTeamPermission(permission: string): boolean {
    const teamPermissions = [
      'team.manage',
      'analyses.view_team',
      'analyses.approve_team'
    ];
    return teamPermissions.includes(permission);
  }

  /**
   * Check if permission is ownership-based
   */
  private isOwnershipPermission(permission: string): boolean {
    const ownershipPermissions = [
      'analyses.view_own',
      'analyses.edit_own',
      'analyses.delete_own'
    ];
    return ownershipPermissions.includes(permission);
  }

  /**
   * Get approval limit for role
   */
  private getApprovalLimitForRole(role: string): number {
    const roleConfig = this.ENTERPRISE_RBAC.roles[role as keyof typeof this.ENTERPRISE_RBAC.roles];
    return roleConfig ? roleConfig.analysisApprovalLimitCents : this.ANALYSIS_COST_CENTS;
  }

  /**
   * Log role change for audit
   */
  private async logRoleChange(entry: AuditLogEntry): Promise<void> {
    // This would be implemented to write to an audit log
    console.log('Role change logged:', entry);
  }

  /**
   * Log audit event to enterprise audit log
   */
  private async logAuditEvent(
    organizationId: string,
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details: any
  ): Promise<void> {
    try {
      await supabaseAdmin
        .from('audit_logs')
        .insert([{
          organization_id: organizationId,
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details,
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }
}

// Export singleton instance
export const permissionManager = new PermissionManager();