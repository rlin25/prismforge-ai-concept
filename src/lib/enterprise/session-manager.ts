// Enterprise Session Manager
// PrismForge AI - Secure Session Management with Enterprise Security Policies

import { supabase, supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

interface User {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  analysis_approval_limit_cents: number;
  full_name?: string;
}

interface Organization {
  id: string;
  name: string;
  plan_type: string;
  security_settings?: SecuritySettings;
}

interface SecuritySettings {
  max_session_hours?: number;
  session_timeout_hours?: number;
  require_mfa?: boolean;
  ip_whitelist?: string[];
  device_tracking?: boolean;
}

interface SessionOptions {
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
  ssoProvider?: string;
  organizationId?: string;
  expiresAt?: Date;
}

interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  browser?: string;
  fingerprint?: string;
}

interface Session {
  id: string;
  user_id: string;
  organization_id: string;
  session_token: string;
  device_info?: DeviceInfo;
  ip_address?: string;
  sso_provider?: string;
  created_at: Date;
  expires_at: Date;
  last_activity: Date;
  token: string;
  expiresIn: number;
}

interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  user?: User;
  reason?: string;
}

interface SessionMetrics {
  active_sessions: number;
  total_sessions_today: number;
  failed_attempts: number;
  unique_users: number;
  sessions_by_provider: Record<string, number>;
}

export class EnterpriseSessionManager {
  private readonly MAX_SESSION_DURATION_HOURS = 24;
  private readonly DEFAULT_SESSION_DURATION_HOURS = 8;
  private readonly SESSION_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    // Start session cleanup background task
    this.startSessionCleanup();
  }

  /**
   * Create secure enterprise session
   */
  async createSession(
    user: User,
    options: SessionOptions = {}
  ): Promise<Session> {
    try {
      const organization = await this.getOrganization(user.organization_id);
      const securitySettings = organization.security_settings || {};
      
      // Calculate session expiry based on org security policy
      const expiresAt = options.expiresAt || this.calculateSessionExpiry(securitySettings);
      
      const sessionId = crypto.randomUUID();
      const sessionToken = this.generateSecureToken();
      
      const session = {
        id: sessionId,
        user_id: user.id,
        organization_id: user.organization_id,
        session_token: sessionToken,
        device_info: options.deviceInfo,
        ip_address: options.ipAddress,
        sso_provider: options.ssoProvider,
        created_at: new Date(),
        expires_at: expiresAt,
        last_activity: new Date()
      };
      
      // Store session securely in database
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .insert([session]);
      
      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }
      
      // Generate JWT token with enterprise claims
      const token = this.generateJWTToken(session, user, organization);
      
      // Log session creation
      await this.logAuditEvent(
        user.organization_id,
        user.id,
        'session_created',
        'session',
        sessionId,
        {
          ssoProvider: options.ssoProvider,
          ipAddress: options.ipAddress,
          deviceInfo: options.deviceInfo,
          expiresAt: expiresAt.toISOString()
        }
      );
      
      return {
        ...session,
        token,
        expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      };
      
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  /**
   * Validate session and return user info
   */
  async validateSession(token: string): Promise<SessionValidationResult> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get session from database
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', decoded.sessionId)
        .single();
      
      if (error || !session) {
        return { valid: false, reason: 'Session not found' };
      }
      
      // Check if session expired
      if (new Date(session.expires_at) < new Date()) {
        await this.destroySession(session.id);
        return { valid: false, reason: 'Session expired' };
      }
      
      // Get user info
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user_id)
        .single();
      
      if (!user) {
        return { valid: false, reason: 'User not found' };
      }
      
      // Update last activity
      await this.updateSessionActivity(session.id);
      
      return {
        valid: true,
        session: {
          ...session,
          created_at: new Date(session.created_at),
          expires_at: new Date(session.expires_at),
          last_activity: new Date(session.last_activity),
          token,
          expiresIn: Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000)
        },
        user
      };
      
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, reason: 'Invalid token' };
    }
  }

  /**
   * Refresh session and extend expiry
   */
  async refreshSession(sessionId: string, userId: string): Promise<Session | null> {
    try {
      // Get current session
      const { data: currentSession } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();
      
      if (!currentSession) {
        return null;
      }
      
      // Get user and organization for security settings
      const { data: user } = await supabase
        .from('users')
        .select('*, organizations(*)')
        .eq('id', userId)
        .single();
      
      if (!user) {
        return null;
      }
      
      const organization = user.organizations;
      const securitySettings = organization.security_settings || {};
      
      // Calculate new expiry
      const newExpiresAt = this.calculateSessionExpiry(securitySettings);
      
      // Update session
      const { data: updatedSession, error } = await supabaseAdmin
        .from('user_sessions')
        .update({
          expires_at: newExpiresAt.toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error || !updatedSession) {
        return null;
      }
      
      // Generate new JWT token
      const token = this.generateJWTToken(updatedSession, user, organization);
      
      // Log session refresh
      await this.logAuditEvent(
        user.organization_id,
        userId,
        'session_refreshed',
        'session',
        sessionId,
        {
          newExpiresAt: newExpiresAt.toISOString(),
          refreshedAt: new Date().toISOString()
        }
      );
      
      return {
        ...updatedSession,
        created_at: new Date(updatedSession.created_at),
        expires_at: new Date(updatedSession.expires_at),
        last_activity: new Date(updatedSession.last_activity),
        token,
        expiresIn: Math.floor((newExpiresAt.getTime() - Date.now()) / 1000)
      };
      
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }

  /**
   * Destroy session (logout)
   */
  async destroySession(sessionId: string, userId?: string): Promise<void> {
    try {
      let query = supabaseAdmin
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { error } = await query;
      
      if (error) {
        throw new Error(`Failed to destroy session: ${error.message}`);
      }
      
      // Log session destruction
      if (userId) {
        const { data: user } = await supabase
          .from('users')
          .select('organization_id')
          .eq('id', userId)
          .single();
        
        if (user) {
          await this.logAuditEvent(
            user.organization_id,
            userId,
            'session_destroyed',
            'session',
            sessionId,
            {
              destroyedAt: new Date().toISOString(),
              reason: 'user_logout'
            }
          );
        }
      }
      
    } catch (error) {
      console.error('Destroy session error:', error);
      throw error;
    }
  }

  /**
   * Destroy all sessions for user
   */
  async destroyAllUserSessions(userId: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(`Failed to destroy user sessions: ${error.message}`);
      }
      
      // Log session destruction
      const { data: user } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();
      
      if (user) {
        await this.logAuditEvent(
          user.organization_id,
          userId,
          'all_sessions_destroyed',
          'user',
          userId,
          {
            destroyedAt: new Date().toISOString(),
            reason: 'security_action'
          }
        );
      }
      
    } catch (error) {
      console.error('Destroy all user sessions error:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('last_activity', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get user sessions: ${error.message}`);
      }
      
      return (sessions || []).map(session => ({
        ...session,
        created_at: new Date(session.created_at),
        expires_at: new Date(session.expires_at),
        last_activity: new Date(session.last_activity),
        token: '', // Don't return actual token
        expiresIn: Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000)
      }));
      
    } catch (error) {
      console.error('Get user sessions error:', error);
      return [];
    }
  }

  /**
   * Get session metrics for organization
   */
  async getSessionMetrics(organizationId: string): Promise<SessionMetrics> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Active sessions
      const { data: activeSessions } = await supabase
        .from('user_sessions')
        .select('id, sso_provider, user_id')
        .eq('organization_id', organizationId)
        .gt('expires_at', new Date().toISOString());
      
      // Sessions created today
      const { data: todaySessions } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('organization_id', organizationId)
        .gte('created_at', today.toISOString());
      
      // Group by SSO provider
      const sessionsByProvider: Record<string, number> = {};
      (activeSessions || []).forEach(session => {
        const provider = session.sso_provider || 'email';
        sessionsByProvider[provider] = (sessionsByProvider[provider] || 0) + 1;
      });
      
      return {
        active_sessions: activeSessions?.length || 0,
        total_sessions_today: todaySessions?.length || 0,
        failed_attempts: 0, // Would need separate tracking
        unique_users: new Set(activeSessions?.map(s => s.user_id)).size,
        sessions_by_provider: sessionsByProvider
      };
      
    } catch (error) {
      console.error('Get session metrics error:', error);
      return {
        active_sessions: 0,
        total_sessions_today: 0,
        failed_attempts: 0,
        unique_users: 0,
        sessions_by_provider: {}
      };
    }
  }

  /**
   * Calculate session expiry based on security settings
   */
  private calculateSessionExpiry(securitySettings: SecuritySettings): Date {
    const maxExpiry = securitySettings.max_session_hours || this.MAX_SESSION_DURATION_HOURS;
    const sessionTimeout = securitySettings.session_timeout_hours || this.DEFAULT_SESSION_DURATION_HOURS;
    
    const expiryHours = Math.min(sessionTimeout, maxExpiry);
    const expiryMs = expiryHours * 60 * 60 * 1000;
    
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Generate secure session token
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate JWT token with enterprise claims
   */
  private generateJWTToken(session: any, user: User, organization: Organization): string {
    return jwt.sign(
      {
        sessionId: session.id,
        userId: user.id,
        organizationId: user.organization_id,
        role: user.role,
        approvalLimitCents: user.analysis_approval_limit_cents,
        planType: organization.plan_type,
        email: user.email,
        fullName: user.full_name
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: Math.floor((session.expires_at.getTime() - Date.now()) / 1000),
        issuer: 'prismforge-ai',
        audience: 'prismforge-users',
        subject: user.id
      }
    );
  }

  /**
   * Update session last activity
   */
  private async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('user_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Update session activity error:', error);
    }
  }

  /**
   * Get organization info
   */
  private async getOrganization(organizationId: string): Promise<Organization> {
    try {
      const { data: organization, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single();
      
      if (error || !organization) {
        throw new Error('Organization not found');
      }
      
      return organization;
    } catch (error) {
      console.error('Get organization error:', error);
      throw error;
    }
  }

  /**
   * Start background session cleanup task
   */
  private startSessionCleanup(): void {
    setInterval(async () => {
      try {
        // Clean up expired sessions
        await supabaseAdmin
          .from('user_sessions')
          .delete()
          .lt('expires_at', new Date().toISOString());
        
      } catch (error) {
        console.error('Session cleanup error:', error);
      }
    }, this.SESSION_CLEANUP_INTERVAL_MS);
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
export const enterpriseSessionManager = new EnterpriseSessionManager();