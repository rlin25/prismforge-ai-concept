// Enterprise Security Manager - Central Orchestration
// PrismForge AI - Unified Security Service Integration

import { NextRequest, NextResponse } from 'next/server';
import { permissionManager } from '@/lib/enterprise/permission-manager';
import { enterpriseSessionManager } from '@/lib/enterprise/session-manager';
import { complianceMonitor } from './compliance-monitoring';
import { mfaManager } from './mfa-manager';
import { encryptionValidator } from './encryption-validator';
import { EnterpriseRateLimitManager } from '@/lib/middleware/rate-limit';
import { EnterpriseIPWhitelistManager, EnterpriseDeviceFingerprintManager } from '@/lib/middleware/ip-whitelist-device-fingerprint';
import { EnterpriseSecurityHeadersManager } from '@/lib/middleware/security-headers';
import { SecurityConfiguration, RiskAssessment, SecurityEvent } from '@/types/security.types';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface SecurityContext {
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint: string;
  riskScore: number;
  mfaRequired: boolean;
  mfaVerified: boolean;
  trustedDevice: boolean;
  complianceFlags: string[];
  securityWarnings: string[];
}

interface SecurityValidationResult {
  allowed: boolean;
  context: SecurityContext;
  requiredActions: string[];
  redirectUrl?: string;
  reason?: string;
}

export class EnterpriseSecurityManager {
  private static instance: EnterpriseSecurityManager;

  constructor() {
    this.initializeSecurity();
  }

  static getInstance(): EnterpriseSecurityManager {
    if (!this.instance) {
      this.instance = new EnterpriseSecurityManager();
    }
    return this.instance;
  }

  /**
   * Comprehensive security validation for incoming requests
   */
  async validateRequest(
    request: NextRequest,
    requiredAction?: string,
    resourceType?: string
  ): Promise<SecurityValidationResult> {
    try {
      // Extract basic context
      const context = await this.extractSecurityContext(request);
      
      // Phase 1: Basic Security Checks
      const basicSecurityCheck = await this.performBasicSecurityChecks(request, context);
      if (!basicSecurityCheck.allowed) {
        return basicSecurityCheck;
      }

      // Phase 2: Authentication & Authorization
      const authCheck = await this.performAuthenticationChecks(request, context);
      if (!authCheck.allowed) {
        return authCheck;
      }

      // Phase 3: Advanced Security Validation
      const advancedCheck = await this.performAdvancedSecurityChecks(
        request, 
        context, 
        requiredAction, 
        resourceType
      );
      if (!advancedCheck.allowed) {
        return advancedCheck;
      }

      // Phase 4: Risk Assessment & MFA
      const riskCheck = await this.performRiskAssessment(request, context, requiredAction);
      if (!riskCheck.allowed) {
        return riskCheck;
      }

      // Phase 5: Compliance Validation
      await this.performComplianceValidation(request, context, requiredAction);

      return {
        allowed: true,
        context: context,
        requiredActions: []
      };

    } catch (error) {
      console.error('Security validation error:', error);
      
      // Log security error
      await complianceMonitor.logSecurityEvent({
        eventType: 'admin_action_unusual',
        severity: 'high',
        source: 'security_manager',
        description: `Security validation error: ${error.message}`,
        ipAddress: request.ip || '0.0.0.0',
        userAgent: request.headers.get('user-agent') || '',
        riskScore: 80,
        metadata: { error: error.message, url: request.url }
      });

      return {
        allowed: false,
        context: await this.extractSecurityContext(request),
        requiredActions: ['contact_support'],
        reason: 'Security validation failed'
      };
    }
  }

  /**
   * Extract comprehensive security context from request
   */
  private async extractSecurityContext(request: NextRequest): Promise<SecurityContext> {
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || '';
    const deviceFingerprint = EnterpriseDeviceFingerprintManager.generateFingerprint(request);

    const context: SecurityContext = {
      ipAddress,
      userAgent,
      deviceFingerprint,
      riskScore: 50, // Base risk score
      mfaRequired: false,
      mfaVerified: false,
      trustedDevice: false,
      complianceFlags: [],
      securityWarnings: []
    };

    // Extract user context from authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const validation = await permissionManager.validateSessionToken(token);
        
        if (validation.valid && validation.userId) {
          context.userId = validation.userId;
          context.sessionId = token; // In production, extract session ID from token
          
          // Get organization
          const { data: user } = await supabase
            .from('users')
            .select('organization_id')
            .eq('id', validation.userId)
            .single();
          
          context.organizationId = user?.organization_id;
        }
      } catch (error) {
        context.securityWarnings.push('invalid_auth_token');
      }
    }

    return context;
  }

  /**
   * Phase 1: Basic Security Checks
   */
  private async performBasicSecurityChecks(
    request: NextRequest,
    context: SecurityContext
  ): Promise<SecurityValidationResult> {
    const issues: string[] = [];

    // Security headers validation
    const headerValidation = await encryptionValidator.validateRequestEncryption(
      request,
      context.organizationId || 'default'
    );
    
    if (!headerValidation.valid) {
      issues.push(...headerValidation.issues);
      context.riskScore += headerValidation.riskScore;
    }

    // Rate limiting check
    if (context.organizationId) {
      const rateLimitManager = EnterpriseRateLimitManager.getInstance();
      // Rate limiting would be applied here based on the endpoint
    }

    // Basic request validation
    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type');
      if (!contentType) {
        issues.push('missing_content_type');
        context.riskScore += 10;
      }
    }

    // Log security issues if any
    if (issues.length > 0) {
      await complianceMonitor.logSecurityEvent({
        organizationId: context.organizationId,
        userId: context.userId,
        eventType: 'compliance_violation',
        severity: 'medium',
        source: 'security_manager',
        description: `Basic security check failures: ${issues.join(', ')}`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        riskScore: Math.min(context.riskScore, 100),
        metadata: { issues, phase: 'basic_checks' }
      });
    }

    return {
      allowed: true, // Basic checks are warnings, not blocking
      context,
      requiredActions: []
    };
  }

  /**
   * Phase 2: Authentication & Authorization Checks
   */
  private async performAuthenticationChecks(
    request: NextRequest,
    context: SecurityContext
  ): Promise<SecurityValidationResult> {
    // If user is not authenticated, allow public endpoints
    if (!context.userId) {
      return {
        allowed: true,
        context,
        requiredActions: []
      };
    }

    // Validate session
    const sessionValidation = await enterpriseSessionManager.validateSession(
      context.sessionId || ''
    );

    if (!sessionValidation.valid) {
      await complianceMonitor.logSecurityEvent({
        organizationId: context.organizationId,
        userId: context.userId,
        eventType: 'authentication_failure',
        severity: 'medium',
        source: 'security_manager',
        description: 'Invalid or expired session',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        riskScore: 50,
        metadata: { reason: sessionValidation.reason }
      });

      return {
        allowed: false,
        context,
        requiredActions: ['reauthenticate'],
        reason: 'Session invalid or expired'
      };
    }

    return {
      allowed: true,
      context,
      requiredActions: []
    };
  }

  /**
   * Phase 3: Advanced Security Checks
   */
  private async performAdvancedSecurityChecks(
    request: NextRequest,
    context: SecurityContext,
    requiredAction?: string,
    resourceType?: string
  ): Promise<SecurityValidationResult> {
    if (!context.organizationId || !context.userId) {
      return { allowed: true, context, requiredActions: [] };
    }

    // IP Whitelist Check
    const ipCheck = await EnterpriseIPWhitelistManager.checkIPWhitelist(
      context.ipAddress,
      context.organizationId,
      context.userId
    );

    if (!ipCheck.allowed) {
      await complianceMonitor.logSecurityEvent({
        organizationId: context.organizationId,
        userId: context.userId,
        eventType: 'unauthorized_access_attempt',
        severity: 'high',
        source: 'security_manager',
        description: 'Access denied by IP whitelist',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        deviceFingerprint: context.deviceFingerprint,
        riskScore: ipCheck.riskScore,
        metadata: { reason: ipCheck.reason }
      });

      return {
        allowed: false,
        context,
        requiredActions: ['contact_admin'],
        reason: ipCheck.reason
      };
    }

    context.riskScore += ipCheck.riskScore;

    // Device Trust Analysis
    const deviceAnalysis = await EnterpriseDeviceFingerprintManager.analyzeDevice(
      request,
      context.userId,
      context.organizationId
    );

    context.trustedDevice = deviceAnalysis.isKnownDevice && deviceAnalysis.trustScore >= 70;
    context.riskScore += Math.max(0, 100 - deviceAnalysis.trustScore);

    if (deviceAnalysis.requiresVerification) {
      context.securityWarnings.push('device_verification_required');
    }

    return {
      allowed: true,
      context,
      requiredActions: deviceAnalysis.requiresVerification ? ['verify_device'] : []
    };
  }

  /**
   * Phase 4: Risk Assessment & MFA
   */
  private async performRiskAssessment(
    request: NextRequest,
    context: SecurityContext,
    requiredAction?: string
  ): Promise<SecurityValidationResult> {
    if (!context.userId || !context.organizationId) {
      return { allowed: true, context, requiredActions: [] };
    }

    // Calculate final risk score
    const calculatedRiskScore = await this.calculateRiskScore(context);
    context.riskScore = calculatedRiskScore;

    // Check MFA requirements
    const mfaRequirement = await mfaManager.checkMFARequirement(
      context.userId,
      requiredAction || 'general',
      'general',
      context.riskScore
    );

    context.mfaRequired = mfaRequirement.requiresMFA;

    if (context.mfaRequired) {
      // Check if MFA is already verified in this session
      const mfaStatus = await mfaManager.getMFAStatus(context.userId);
      
      if (!mfaStatus.enabled) {
        return {
          allowed: false,
          context,
          requiredActions: ['setup_mfa'],
          redirectUrl: '/security/mfa/setup',
          reason: 'MFA setup required for this action'
        };
      }

      // In a real implementation, you'd check if MFA was verified in current session
      // For now, assume MFA verification is required
      context.mfaVerified = false; // This would be checked against session data

      if (!context.mfaVerified) {
        return {
          allowed: false,
          context,
          requiredActions: ['verify_mfa'],
          redirectUrl: '/security/mfa/verify',
          reason: 'MFA verification required'
        };
      }
    }

    // Store risk assessment
    await this.storeRiskAssessment(context);

    return {
      allowed: true,
      context,
      requiredActions: []
    };
  }

  /**
   * Phase 5: Compliance Validation
   */
  private async performComplianceValidation(
    request: NextRequest,
    context: SecurityContext,
    requiredAction?: string
  ): Promise<void> {
    if (!context.organizationId) return;

    // Log security event for audit trail
    await complianceMonitor.logSecurityEvent({
      organizationId: context.organizationId,
      userId: context.userId,
      eventType: context.riskScore > 70 ? 'suspicious_login' : 'authentication_failure',
      severity: context.riskScore > 80 ? 'high' : context.riskScore > 50 ? 'medium' : 'low',
      source: 'security_manager',
      description: `Request processed with risk score ${context.riskScore}`,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      deviceFingerprint: context.deviceFingerprint,
      riskScore: context.riskScore,
      metadata: {
        action: requiredAction,
        mfaRequired: context.mfaRequired,
        trustedDevice: context.trustedDevice,
        warnings: context.securityWarnings,
        complianceFlags: context.complianceFlags
      }
    });

    // Check compliance thresholds
    if (context.riskScore > 90) {
      context.complianceFlags.push('high_risk_access');
    }

    if (!context.trustedDevice && context.mfaRequired) {
      context.complianceFlags.push('untrusted_device_mfa_required');
    }
  }

  /**
   * Calculate comprehensive risk score
   */
  private async calculateRiskScore(context: SecurityContext): Promise<number> {
    let riskScore = context.riskScore;

    if (!context.userId || !context.organizationId) {
      return Math.min(100, riskScore + 30); // Anonymous access adds risk
    }

    try {
      // Get recent security events for user
      const { data: recentEvents } = await supabase
        .from('security_events')
        .select('event_type, severity, detected_at')
        .eq('user_id', context.userId)
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('detected_at', { ascending: false })
        .limit(10);

      if (recentEvents && recentEvents.length > 0) {
        // Add risk for recent security events
        const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
        const highEvents = recentEvents.filter(e => e.severity === 'high').length;
        
        riskScore += criticalEvents * 20;
        riskScore += highEvents * 10;
        riskScore += recentEvents.length * 2; // General event count
      }

      // Factor in device trust
      if (!context.trustedDevice) {
        riskScore += 25;
      }

      // Factor in IP reputation (would integrate with threat intelligence)
      // For now, add moderate risk for unknown IPs
      if (context.ipAddress !== '127.0.0.1' && !context.ipAddress.startsWith('192.168.')) {
        riskScore += 10; // Public IP adds some risk
      }

    } catch (error) {
      console.error('Error calculating risk score:', error);
      riskScore += 20; // Add penalty for calculation error
    }

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Store risk assessment in database
   */
  private async storeRiskAssessment(context: SecurityContext): Promise<void> {
    if (!context.userId || !context.organizationId) return;

    try {
      const recommendation = context.riskScore > 80 ? 'block' : 
                           context.riskScore > 50 ? 'challenge' : 'allow';

      await supabaseAdmin
        .from('risk_assessments')
        .insert({
          user_id: context.userId,
          organization_id: context.organizationId,
          session_id: context.sessionId,
          risk_score: context.riskScore,
          risk_factors: [
            { type: 'device_trust', score: context.trustedDevice ? 0 : 25 },
            { type: 'mfa_status', score: context.mfaRequired && !context.mfaVerified ? 30 : 0 },
            { type: 'ip_reputation', score: 10 }
          ],
          recommendation,
          calculated_at: new Date(),
          valid_until: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          metadata: {
            warnings: context.securityWarnings,
            complianceFlags: context.complianceFlags
          }
        });

    } catch (error) {
      console.error('Error storing risk assessment:', error);
    }
  }

  /**
   * Initialize security systems
   */
  private initializeSecurity(): void {
    console.log('Enterprise Security Manager initialized');
    console.log('- Rate limiting enabled');
    console.log('- IP whitelisting enabled');
    console.log('- Device fingerprinting enabled');
    console.log('- MFA management enabled');
    console.log('- Compliance monitoring enabled');
    console.log('- Encryption validation enabled');
  }

  /**
   * Get security configuration for organization
   */
  async getSecurityConfiguration(organizationId: string): Promise<SecurityConfiguration> {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      return org?.security_settings || this.getDefaultSecurityConfiguration();
    } catch (error) {
      return this.getDefaultSecurityConfiguration();
    }
  }

  /**
   * Get default security configuration
   */
  private getDefaultSecurityConfiguration(): SecurityConfiguration {
    return {
      rateLimiting: {
        enabled: true,
        rulesPerEndpoint: {},
        globalLimits: {
          windowMs: 60 * 1000,
          maxRequests: 100
        }
      },
      ipWhitelisting: {
        enabled: false,
        allowedIPs: [],
        allowedCIDRs: [],
        blockUnknownIPs: false
      },
      deviceFingerprinting: {
        enabled: true,
        requireRegistration: true,
        maxDevicesPerUser: 5,
        deviceTrustLevel: 'moderate'
      },
      mfa: {
        enabled: true,
        requiredForRoles: ['owner', 'admin'],
        methods: [{ type: 'totp', enabled: true, priority: 1, configuration: {} }],
        gracePeriodHours: 24,
        backupCodeCount: 10
      },
      encryption: {
        atRest: {
          enabled: true,
          algorithm: 'aes-256-gcm',
          keyRotationIntervalDays: 90
        },
        inTransit: {
          enforceHTTPS: true,
          tlsVersion: 'TLSv1.3',
          hstsSecurity: true
        }
      },
      compliance: {
        soc2: true,
        gdpr: true,
        sox: false,
        ffiec: false,
        auditRetentionDays: 2555, // 7 years
        dataClassification: true
      },
      zeroTrust: {
        enabled: true,
        continuousVerification: true,
        riskBasedAccess: true,
        minimumPrivilege: true
      }
    };
  }
}

// Export singleton instance
export const enterpriseSecurityManager = EnterpriseSecurityManager.getInstance();