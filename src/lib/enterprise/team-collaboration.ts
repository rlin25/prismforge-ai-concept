// Team Collaboration Service
// PrismForge AI - Enterprise Team Management and Analysis Sharing

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { permissionManager } from './permission-manager';

interface CreateTeamRequest {
  name: string;
  description?: string;
  teamLeadId?: string;
  defaultPermissions?: string[];
  budgetLimitCents?: number;
}

interface Team {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  team_lead_id?: string;
  default_permissions: string[];
  team_budget_limit_cents?: number;
  created_at: string;
  updated_at: string;
}

interface SharingPermissions {
  canEdit: boolean;
  canShare: boolean;
  canExport: boolean;
  canComment: boolean;
}

interface TeamAnalysisView {
  id: string;
  title?: string;
  status: string;
  cost_cents: number;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
  team?: {
    id: string;
    name: string;
  };
  shared_permissions?: SharingPermissions;
  billing_status: string;
}

interface NotificationData {
  type: string;
  analysisId: string;
  sharedBy: string;
  permissions: SharingPermissions;
  analysisValueCents: number;
}

export class TeamCollaborationService {
  private readonly ANALYSIS_COST_CENTS = 50000; // $500 per professional validation

  /**
   * Create a new team
   */
  async createTeam(
    organizationId: string,
    teamData: CreateTeamRequest,
    createdBy: string
  ): Promise<Team> {
    // Verify permissions
    const canCreateTeam = await permissionManager.checkPermission(
      createdBy, 
      'teams.manage'
    );
    
    if (!canCreateTeam) {
      throw new Error('Insufficient permissions to create team');
    }

    // Verify organization access
    const hasOrgAccess = await permissionManager.checkOrganizationAccess(createdBy, organizationId);
    if (!hasOrgAccess) {
      throw new Error('Access denied: Cannot create team for this organization');
    }

    try {
      // Create team
      const { data: team, error } = await supabaseAdmin
        .from('teams')
        .insert([{
          organization_id: organizationId,
          name: teamData.name,
          description: teamData.description,
          team_lead_id: teamData.teamLeadId || createdBy,
          default_permissions: teamData.defaultPermissions || [],
          team_budget_limit_cents: teamData.budgetLimitCents
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create team: ${error.message}`);
      }

      // Add creator as team lead
      await this.addTeamMember(team.id, createdBy, 'lead');

      // Log audit event
      await this.logAuditEvent(
        organizationId,
        createdBy,
        'team_created',
        'team',
        team.id,
        {
          teamName: teamData.name,
          budgetLimitCents: teamData.budgetLimitCents,
          memberCount: 1
        }
      );

      return team;
      
    } catch (error) {
      console.error('Create team error:', error);
      throw error;
    }
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    userId: string,
    role: 'lead' | 'member' = 'member'
  ): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('team_memberships')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role
        }]);

      if (error) {
        throw new Error(`Failed to add team member: ${error.message}`);
      }
      
    } catch (error) {
      console.error('Add team member error:', error);
      throw error;
    }
  }

  /**
   * Share analysis with team
   */
  async shareAnalysisWithTeam(
    analysisId: string,
    teamId: string,
    sharedBy: string,
    permissions: SharingPermissions = { 
      canEdit: false, 
      canShare: false, 
      canExport: true, 
      canComment: true 
    }
  ): Promise<void> {
    // Verify user can share this analysis
    const canShare = await permissionManager.checkPermission(
      sharedBy,
      'analyses.share',
      { resourceId: analysisId }
    );
    
    if (!canShare) {
      throw new Error('Insufficient permissions to share analysis');
    }

    // Verify team membership or admin access
    const isMember = await this.isTeamMember(teamId, sharedBy);
    const isAdmin = await permissionManager.checkPermission(sharedBy, 'analyses.view_all');
    
    if (!isMember && !isAdmin) {
      throw new Error('Access denied: Not a team member');
    }

    try {
      // Create sharing record
      const { error } = await supabaseAdmin
        .from('analysis_shares')
        .insert([{
          analysis_id: analysisId,
          team_id: teamId,
          shared_by: sharedBy,
          permissions: permissions
        }]);

      if (error) {
        throw new Error(`Failed to share analysis: ${error.message}`);
      }

      // Get team info for notifications
      const { data: team } = await supabase
        .from('teams')
        .select('name, organization_id')
        .eq('id', teamId)
        .single();

      // Notify team members
      if (team) {
        await this.notifyTeamMembers(teamId, {
          type: 'analysis_shared',
          analysisId,
          sharedBy,
          permissions,
          analysisValueCents: this.ANALYSIS_COST_CENTS
        });

        // Log audit event
        await this.logAuditEvent(
          team.organization_id,
          sharedBy,
          'analysis_shared',
          'analysis',
          analysisId,
          {
            teamId,
            teamName: team.name,
            permissions,
            sharedWith: 'team'
          }
        );
      }
      
    } catch (error) {
      console.error('Share analysis error:', error);
      throw error;
    }
  }

  /**
   * Get team analyses with billing info
   */
  async getTeamAnalyses(
    teamId: string,
    requestedBy: string
  ): Promise<TeamAnalysisView[]> {
    // Verify team membership
    const isMember = await this.isTeamMember(teamId, requestedBy);
    if (!isMember) {
      throw new Error('Access denied: Not a team member');
    }

    try {
      // Get analyses owned by team
      const { data: teamAnalyses, error: teamError } = await supabase
        .from('analysis_sessions')
        .select(`
          id,
          status,
          cost_cents,
          billing_status,
          created_at,
          users!inner (
            id,
            email,
            full_name
          ),
          teams!inner (
            id,
            name
          )
        `)
        .eq('team_id', teamId)
        .order('created_at', { ascending: false });

      if (teamError) {
        throw new Error(`Failed to get team analyses: ${teamError.message}`);
      }

      // Get shared analyses
      const { data: sharedAnalyses, error: sharedError } = await supabase
        .from('analysis_shares')
        .select(`
          permissions,
          analysis_sessions!inner (
            id,
            status,
            cost_cents,
            billing_status,
            created_at,
            users!inner (
              id,
              email,
              full_name
            )
          )
        `)
        .eq('team_id', teamId)
        .order('shared_at', { ascending: false });

      if (sharedError) {
        throw new Error(`Failed to get shared analyses: ${sharedError.message}`);
      }

      // Combine and format results
      const teamAnalysisViews: TeamAnalysisView[] = (teamAnalyses || []).map((analysis: any) => ({
        id: analysis.id,
        status: analysis.status,
        cost_cents: analysis.cost_cents,
        billing_status: analysis.billing_status,
        created_at: analysis.created_at,
        user: Array.isArray(analysis.users) ? analysis.users[0] : analysis.users,
        team: Array.isArray(analysis.teams) ? analysis.teams[0] : analysis.teams
      }));

      const sharedAnalysisViews: TeamAnalysisView[] = (sharedAnalyses || []).map((share: any) => ({
        id: share.analysis_sessions.id,
        status: share.analysis_sessions.status,
        cost_cents: share.analysis_sessions.cost_cents,
        billing_status: share.analysis_sessions.billing_status,
        created_at: share.analysis_sessions.created_at,
        user: Array.isArray(share.analysis_sessions.users) ? share.analysis_sessions.users[0] : share.analysis_sessions.users,
        shared_permissions: share.permissions as SharingPermissions
      }));

      return [...teamAnalysisViews, ...sharedAnalysisViews];
      
    } catch (error) {
      console.error('Get team analyses error:', error);
      throw error;
    }
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    try {
      const { data: memberships, error } = await supabase
        .from('team_memberships')
        .select(`
          role,
          teams!inner (
            id,
            organization_id,
            name,
            description,
            team_lead_id,
            default_permissions,
            team_budget_limit_cents,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get user teams: ${error.message}`);
      }

      return (memberships || []).map((membership: any) => membership.teams).flat();
      
    } catch (error) {
      console.error('Get user teams error:', error);
      throw error;
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string, requestedBy: string): Promise<any[]> {
    // Verify team membership or admin access
    const isMember = await this.isTeamMember(teamId, requestedBy);
    const isAdmin = await permissionManager.checkPermission(requestedBy, 'users.manage');
    
    if (!isMember && !isAdmin) {
      throw new Error('Access denied: Not authorized to view team members');
    }

    try {
      const { data: members, error } = await supabase
        .from('team_memberships')
        .select(`
          role,
          joined_at,
          users!inner (
            id,
            email,
            full_name,
            role,
            last_login
          )
        `)
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to get team members: ${error.message}`);
      }

      return members || [];
      
    } catch (error) {
      console.error('Get team members error:', error);
      throw error;
    }
  }

  /**
   * Remove team member
   */
  async removeTeamMember(
    teamId: string,
    userId: string,
    removedBy: string
  ): Promise<void> {
    // Check permissions (team lead or admin)
    const isTeamLead = await this.isTeamLead(teamId, removedBy);
    const canManageUsers = await permissionManager.checkPermission(removedBy, 'users.manage');
    
    if (!isTeamLead && !canManageUsers) {
      throw new Error('Insufficient permissions to remove team member');
    }

    try {
      const { error } = await supabaseAdmin
        .from('team_memberships')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to remove team member: ${error.message}`);
      }

      // Log audit event
      const { data: team } = await supabase
        .from('teams')
        .select('organization_id, name')
        .eq('id', teamId)
        .single();

      if (team) {
        await this.logAuditEvent(
          team.organization_id,
          removedBy,
          'team_member_removed',
          'team',
          teamId,
          {
            removedUserId: userId,
            teamName: team.name
          }
        );
      }
      
    } catch (error) {
      console.error('Remove team member error:', error);
      throw error;
    }
  }

  /**
   * Check if user is team member
   */
  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    try {
      const { data: membership } = await supabase
        .from('team_memberships')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      return !!membership;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is team lead
   */
  async isTeamLead(teamId: string, userId: string): Promise<boolean> {
    try {
      const { data: membership } = await supabase
        .from('team_memberships')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('role', 'lead')
        .single();

      return !!membership;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Notify team members (simplified version)
   */
  private async notifyTeamMembers(teamId: string, notification: NotificationData): Promise<void> {
    // In production, this would send actual notifications
    // For now, just log the notification
    console.log(`Notification to team ${teamId}:`, notification);
  }

  /**
   * Log audit event
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
export const teamCollaborationService = new TeamCollaborationService();