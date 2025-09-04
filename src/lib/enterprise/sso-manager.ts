// Enterprise SSO Manager
// PrismForge AI - Multi-Provider Authentication with Enterprise Features

import { supabase, supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

interface SSOConfiguration {
  providers: {
    microsoft?: {
      enabled: boolean;
      tenantId?: string;
      clientId: string;
      scopes: string[];
      groupMapping?: Record<string, string>;
    };
    google?: {
      enabled: boolean;
      domain?: string;
      clientId: string;
      hostedDomain?: string;
    };
    saml?: {
      enabled: boolean;
      entityId?: string;
      ssoUrl?: string;
      certificate?: string;
    };
  };
  userProvisioning: {
    autoCreateUsers: boolean;
    domainWhitelist?: string[];
    defaultRole: string;
    roleMapping?: Record<string, string>;
  };
  billingIntegration: {
    payPerAnalysis: boolean;
    defaultPaymentMethod?: any;
    approvalRequired: boolean;
    autoApproveLimit: number;
  };
}

interface AuthResult {
  profile: any;
  tokens: any;
  groups?: any[];
}

interface SSOResult {
  success: boolean;
  user?: any;
  organization?: any;
  session?: any;
  redirectUrl: string;
  error?: string;
}

interface Organization {
  id: string;
  name: string;
  plan_type: 'individual' | 'team' | 'enterprise';
  domain_whitelist?: string[];
  sso_configuration: any;
  auto_approve_limit_cents: number;
  default_payment_method?: any;
  security_settings?: any;
}

interface UserProfile {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  groups?: string[];
}

interface User {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  full_name?: string;
  analysis_approval_limit_cents: number;
}

interface SessionOptions {
  ssoProvider: string;
  organizationId: string;
  expiresAt: Date;
  deviceInfo?: any;
  ipAddress?: string;
}

interface Session {
  id: string;
  user_id: string;
  organization_id: string;
  session_token: string;
  expires_at: Date;
  token: string;
  expiresIn: number;
}

export class EnterpriseSSOManager {
  private readonly ANALYSIS_COST_CENTS = 50000; // $500 per professional validation
  
  /**
   * Initialize SSO configuration based on organization type
   */
  async initializeSSO(organizationId: string): Promise<SSOConfiguration> {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error || !org) {
      throw new Error('Organization not found');
    }

    switch (org.plan_type) {
      case 'enterprise':
        return this.setupEnterpriseSSO(org);
      case 'team':
        return this.setupTeamSSO(org);
      default:
        return this.setupBasicAuth(org);
    }
  }

  /**
   * Handle SSO callback and provision user
   */
  async handleSSOCallback(
    provider: string,
    authResult: AuthResult,
    organizationHint?: string
  ): Promise<SSOResult> {
    try {
      // Validate authentication
      const userProfile = await this.validateAuthResult(provider, authResult);
      
      // Determine organization
      const organization = await this.resolveUserOrganization(userProfile, organizationHint);
      
      // Create or update user
      const user = await this.provisionUser(userProfile, organization);
      
      // Create secure session
      const session = await this.createSession(user, {
        ssoProvider: provider,
        organizationId: organization.id,
        expiresAt: this.calculateSessionExpiry(organization.security_settings)
      });
      
      // Log SSO event
      await this.logAuditEvent(organization.id, user.id, 'sso_login', {
        provider,
        email: userProfile.email,
        ip: '0.0.0.0' // Would be actual IP in production
      });
      
      return {
        success: true,
        user,
        organization,
        session,
        redirectUrl: this.getPostLoginRedirect(user, organization)
      };
      
    } catch (error) {
      console.error('SSO callback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        redirectUrl: '/auth/error'
      };
    }
  }

  /**
   * Setup enterprise SSO configuration
   */
  private async setupEnterpriseSSO(org: Organization): Promise<SSOConfiguration> {
    return {
      providers: {
        microsoft: {
          enabled: true,
          tenantId: org.sso_configuration?.microsoft?.tenant_id,
          clientId: process.env.MICROSOFT_CLIENT_ID!,
          scopes: ['openid', 'profile', 'email', 'User.Read'],
          groupMapping: org.sso_configuration?.microsoft?.group_mapping || {}
        },
        google: {
          enabled: true,
          domain: org.domain_whitelist?.[0],
          clientId: process.env.GOOGLE_CLIENT_ID!,
          hostedDomain: org.domain_whitelist?.[0]
        },
        saml: {
          enabled: org.sso_configuration?.saml?.enabled || false,
          entityId: org.sso_configuration?.saml?.entity_id,
          ssoUrl: org.sso_configuration?.saml?.sso_url,
          certificate: org.sso_configuration?.saml?.certificate
        }
      },
      userProvisioning: {
        autoCreateUsers: true,
        domainWhitelist: org.domain_whitelist,
        defaultRole: 'analyst',
        roleMapping: org.sso_configuration?.role_mapping || {}
      },
      billingIntegration: {
        payPerAnalysis: true,
        defaultPaymentMethod: org.default_payment_method,
        approvalRequired: org.auto_approve_limit_cents === 0,
        autoApproveLimit: org.auto_approve_limit_cents
      }
    };
  }

  /**
   * Setup team SSO configuration
   */
  private async setupTeamSSO(org: Organization): Promise<SSOConfiguration> {
    return {
      providers: {
        microsoft: {
          enabled: true,
          clientId: process.env.MICROSOFT_CLIENT_ID!,
          scopes: ['openid', 'profile', 'email']
        },
        google: {
          enabled: true,
          clientId: process.env.GOOGLE_CLIENT_ID!
        }
      },
      userProvisioning: {
        autoCreateUsers: true,
        defaultRole: 'analyst',
        domainWhitelist: org.domain_whitelist
      },
      billingIntegration: {
        payPerAnalysis: true,
        approvalRequired: true,
        autoApproveLimit: org.auto_approve_limit_cents
      }
    };
  }

  /**
   * Setup basic authentication
   */
  private async setupBasicAuth(org: Organization): Promise<SSOConfiguration> {
    return {
      providers: {},
      userProvisioning: {
        autoCreateUsers: false,
        defaultRole: 'analyst'
      },
      billingIntegration: {
        payPerAnalysis: true,
        approvalRequired: true,
        autoApproveLimit: this.ANALYSIS_COST_CENTS
      }
    };
  }

  /**
   * Validate authentication result from provider
   */
  private async validateAuthResult(provider: string, authResult: AuthResult): Promise<UserProfile> {
    switch (provider) {
      case 'google':
        return {
          email: authResult.profile.email,
          name: authResult.profile.name,
          picture: authResult.profile.picture,
          sub: authResult.profile.sub
        };
      
      case 'microsoft':
        return {
          email: authResult.profile.mail || authResult.profile.userPrincipalName,
          name: authResult.profile.displayName,
          sub: authResult.profile.id,
          groups: authResult.groups?.map(g => g.displayName) || []
        };
      
      default:
        throw new Error(`Unsupported SSO provider: ${provider}`);
    }
  }

  /**
   * Resolve user organization from email domain
   */
  private async resolveUserOrganization(profile: UserProfile, organizationHint?: string): Promise<Organization> {
    const emailDomain = profile.email.split('@')[1];
    
    // Try organization hint first
    if (organizationHint) {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationHint)
        .single();
        
      if (org && this.isEmailDomainAllowed(profile.email, org.domain_whitelist)) {
        return org;
      }
    }
    
    // Search by domain whitelist
    const { data: orgs } = await supabase
      .from('organizations')
      .select('*')
      .contains('domain_whitelist', [emailDomain]);
    
    if (orgs && orgs.length > 0) {
      return orgs[0];
    }
    
    // Create individual organization for new users
    return this.createIndividualOrganization(profile);
  }

  /**
   * Create individual organization for new users
   */
  private async createIndividualOrganization(profile: UserProfile): Promise<Organization> {
    const orgName = `${profile.name || profile.email.split('@')[0]}'s Organization`;
    
    const { data: org, error } = await supabaseAdmin
      .from('organizations')
      .insert([{
        name: orgName,
        plan_type: 'individual',
        domain_whitelist: [],
        sso_configuration: {},
        auto_approve_limit_cents: this.ANALYSIS_COST_CENTS
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }
    
    return org;
  }

  /**
   * Provision user from SSO profile
   */
  private async provisionUser(profile: UserProfile, organization: Organization): Promise<User> {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.email)
      .single();
    
    if (existingUser) {
      // Update existing user
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .update({
          full_name: profile.name,
          last_login: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      
      return user;
    } else {
      // Auto-provision new user if domain allowed
      if (!this.isEmailDomainAllowed(profile.email, organization.domain_whitelist) && organization.plan_type !== 'individual') {
        throw new Error('Email domain not authorized for this organization');
      }
      
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .insert([{
          email: profile.email,
          organization_id: organization.id,
          role: 'analyst',
          auth_provider: 'google', // Would be dynamic in production
          full_name: profile.name,
          analysis_approval_limit_cents: this.ANALYSIS_COST_CENTS,
          email_verified: true,
          last_login: new Date().toISOString()
        }])
        .select()
        .single();
        
      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      
      return user;
    }
  }

  /**
   * Create secure session
   */
  private async createSession(user: User, options: SessionOptions): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    const expiresAt = options.expiresAt;
    
    // Store session in database
    const { error } = await supabaseAdmin
      .from('user_sessions')
      .insert([{
        id: sessionId,
        user_id: user.id,
        organization_id: user.organization_id,
        session_token: sessionToken,
        sso_provider: options.ssoProvider,
        expires_at: expiresAt.toISOString(),
        ip_address: options.ipAddress,
        device_info: options.deviceInfo || {}
      }]);
    
    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        sessionId,
        userId: user.id,
        organizationId: user.organization_id,
        role: user.role,
        approvalLimitCents: user.analysis_approval_limit_cents
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
        issuer: 'prismforge-ai',
        audience: 'prismforge-users'
      }
    );
    
    return {
      id: sessionId,
      user_id: user.id,
      organization_id: user.organization_id,
      session_token: sessionToken,
      expires_at: expiresAt,
      token,
      expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    };
  }

  /**
   * Calculate session expiry based on security settings
   */
  private calculateSessionExpiry(securitySettings?: any): Date {
    const defaultExpiry = 8 * 60 * 60 * 1000; // 8 hours
    const maxExpiry = securitySettings?.max_session_hours || 24;
    const sessionTimeout = securitySettings?.session_timeout_hours || 8;
    
    const expiryMs = Math.min(sessionTimeout, maxExpiry) * 60 * 60 * 1000;
    
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Get post-login redirect URL
   */
  private getPostLoginRedirect(user: User, organization: Organization): string {
    // Enterprise users go to dashboard
    if (organization.plan_type === 'enterprise') {
      return '/dashboard?welcome=enterprise';
    }
    
    // Team users go to team dashboard
    if (organization.plan_type === 'team') {
      return '/dashboard?welcome=team';
    }
    
    // Individual users go to onboarding
    return '/dashboard?welcome=individual';
  }

  /**
   * Check if email domain is allowed
   */
  private isEmailDomainAllowed(email: string, domainWhitelist?: string[]): boolean {
    if (!domainWhitelist || domainWhitelist.length === 0) {
      return true; // No restrictions
    }
    
    const emailDomain = email.split('@')[1];
    return domainWhitelist.includes(emailDomain);
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(organizationId: string, userId: string, action: string, details: any): Promise<void> {
    await supabaseAdmin
      .from('audit_logs')
      .insert([{
        organization_id: organizationId,
        user_id: userId,
        action,
        resource_type: 'user',
        resource_id: userId,
        details,
        ip_address: details.ip,
        created_at: new Date().toISOString()
      }]);
  }
}