// Enterprise Multi-Factor Authentication Manager
// PrismForge AI - Advanced MFA Implementation for High-Privilege Users

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { MFASession, MFAMethod, SecurityEvent } from '@/types/security.types';
import { permissionManager } from '@/lib/enterprise/permission-manager';
import { complianceMonitor } from './compliance-monitoring';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import crypto from 'crypto';

interface TOTPSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  tempSecret: string;
}

interface MFAVerificationResult {
  verified: boolean;
  method: string;
  remainingAttempts?: number;
  lockoutUntil?: Date;
  requiresNewMethod?: boolean;
  reason?: string;
}

interface MFARequirement {
  userId: string;
  organizationId: string;
  action: string;
  resourceType: string;
  riskScore: number;
  requiresMFA: boolean;
  reason: string;
  gracePeriodExpires?: Date;
}

export class EnterpriseMFAManager {
  private static instance: EnterpriseMFAManager;
  private readonly MFA_CODE_VALIDITY_WINDOW = 30; // seconds
  private readonly MAX_ATTEMPTS_PER_SESSION = 3;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly BACKUP_CODES_COUNT = 10;

  constructor() {
    this.startMFACleanup();
  }

  static getInstance(): EnterpriseMFAManager {
    if (!this.instance) {
      this.instance = new EnterpriseMFAManager();
    }
    return this.instance;
  }

  /**
   * Check if user requires MFA for specific action
   */
  async checkMFARequirement(
    userId: string,
    action: string,
    resourceType: string = 'general',
    riskScore: number = 50
  ): Promise<MFARequirement> {
    try {
      // Get user and organization info
      const { data: user } = await supabase
        .from('users')
        .select(`
          *,
          organizations (
            id,
            security_settings
          )
        `)
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      const orgSecuritySettings = user.organizations?.security_settings?.mfa || {};
      const requirement: MFARequirement = {
        userId,
        organizationId: user.organization_id,
        action,
        resourceType,
        riskScore,
        requiresMFA: false,
        reason: ''
      };

      // Check if MFA is enabled for organization
      if (!orgSecuritySettings.enabled) {
        requirement.reason = 'MFA not enabled for organization';
        return requirement;
      }

      // Check role-based MFA requirements
      const requiredRoles = orgSecuritySettings.requiredForRoles || ['owner', 'admin'];
      if (requiredRoles.includes(user.role)) {
        requirement.requiresMFA = true;
        requirement.reason = `MFA required for ${user.role} role`;
      }

      // Check action-based MFA requirements
      const mfaRequiredActions = [
        'analysis.approve_high_value',
        'user.manage',
        'billing.manage',
        'organization.settings',
        'report.export_sensitive',
        'audit.access',
        'security.configure'
      ];

      if (mfaRequiredActions.includes(action)) {
        requirement.requiresMFA = true;
        requirement.reason = `MFA required for action: ${action}`;
      }

      // Risk-based MFA requirements
      if (riskScore >= 70) {
        requirement.requiresMFA = true;
        requirement.reason = `MFA required due to high risk score: ${riskScore}`;
      }

      // Check grace period for new MFA requirements
      if (requirement.requiresMFA && orgSecuritySettings.gracePeriodHours) {
        const gracePeriodExpires = await this.getGracePeriodExpiry(userId, user.organization_id);
        if (gracePeriodExpires && gracePeriodExpires > new Date()) {
          requirement.requiresMFA = false;
          requirement.gracePeriodExpires = gracePeriodExpires;
          requirement.reason = `Grace period active until ${gracePeriodExpires.toISOString()}`;
        }
      }

      return requirement;

    } catch (error) {
      console.error('Error checking MFA requirement:', error);
      // Fail secure - require MFA on error for sensitive actions
      return {
        userId,
        organizationId: 'unknown',
        action,
        resourceType,
        riskScore,
        requiresMFA: ['user.manage', 'billing.manage', 'organization.settings'].includes(action),
        reason: 'Error determining MFA requirement - failing secure'
      };
    }
  }

  /**
   * Setup TOTP-based MFA for user
   */
  async setupTOTP(userId: string, organizationId: string): Promise<TOTPSetup> {
    try {
      // Check if user already has TOTP setup
      const { data: existingMFA } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('method_type', 'totp')
        .eq('status', 'active')
        .single();

      if (existingMFA) {
        throw new Error('TOTP already configured for this user');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: 'PrismForge AI',
        account: userId,
        issuer: 'PrismForge AI'
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate backup codes
      const backupCodes = Array.from({ length: this.BACKUP_CODES_COUNT }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Store temporary MFA setup (not activated until verification)
      const mfaId = crypto.randomUUID();
      await supabaseAdmin
        .from('mfa_configs')
        .insert([{
          id: mfaId,
          user_id: userId,
          organization_id: organizationId,
          method_type: 'totp',
          secret_encrypted: this.encryptSecret(secret.base32!),
          backup_codes_encrypted: this.encryptBackupCodes(backupCodes),
          status: 'pending_verification',
          metadata: {
            qr_code_generated: true,
            backup_codes_count: backupCodes.length
          },
          created_at: new Date().toISOString()
        }]);

      // Log MFA setup initiation
      await complianceMonitor.logSecurityEvent({
        organizationId,
        userId,
        eventType: 'mfa_bypass_attempt', // This will be changed to mfa_setup_initiated in production
        severity: 'low',
        source: 'mfa_manager',
        description: 'TOTP MFA setup initiated',
        riskScore: 20,
        metadata: { method: 'totp', setupId: mfaId }
      });

      return {
        secret: secret.base32!,
        qrCode,
        backupCodes,
        tempSecret: mfaId // Used to verify setup
      };

    } catch (error) {
      console.error('Error setting up TOTP:', error);
      throw error;
    }
  }

  /**
   * Verify TOTP setup
   */
  async verifyTOTPSetup(
    userId: string,
    tempSecret: string,
    token: string
  ): Promise<{ verified: boolean; backupCodes?: string[]; reason?: string }> {
    try {
      // Get pending MFA configuration
      const { data: mfaConfig } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('id', tempSecret)
        .eq('user_id', userId)
        .eq('status', 'pending_verification')
        .single();

      if (!mfaConfig) {
        return {
          verified: false,
          reason: 'MFA setup session not found or expired'
        };
      }

      // Decrypt secret and verify token
      const secret = this.decryptSecret(mfaConfig.secret_encrypted);
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: this.MFA_CODE_VALIDITY_WINDOW / 30
      });

      if (!verified) {
        // Increment failed attempts
        await supabaseAdmin
          .from('mfa_configs')
          .update({ 
            failed_attempts: (mfaConfig.failed_attempts || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', tempSecret);

        return {
          verified: false,
          reason: 'Invalid verification code'
        };
      }

      // Activate MFA configuration
      await supabaseAdmin
        .from('mfa_configs')
        .update({
          status: 'active',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', tempSecret);

      // Get backup codes
      const backupCodes = this.decryptBackupCodes(mfaConfig.backup_codes_encrypted);

      // Log successful MFA setup
      await complianceMonitor.logSecurityEvent({
        organizationId: mfaConfig.organization_id,
        userId,
        eventType: 'admin_action_unusual', // This would be mfa_setup_completed in production
        severity: 'low',
        source: 'mfa_manager',
        description: 'TOTP MFA setup completed successfully',
        riskScore: 10,
        metadata: { method: 'totp', configId: mfaConfig.id }
      });

      return {
        verified: true,
        backupCodes
      };

    } catch (error) {
      console.error('Error verifying TOTP setup:', error);
      return {
        verified: false,
        reason: 'Setup verification failed'
      };
    }
  }

  /**
   * Verify MFA token during authentication
   */
  async verifyMFA(
    userId: string,
    token: string,
    method: string = 'totp',
    sessionId?: string
  ): Promise<MFAVerificationResult> {
    try {
      // Check for account lockout
      const lockoutCheck = await this.checkAccountLockout(userId);
      if (lockoutCheck.locked) {
        return {
          verified: false,
          method,
          lockoutUntil: lockoutCheck.lockoutUntil,
          reason: 'Account temporarily locked due to failed attempts'
        };
      }

      // Get active MFA configuration
      const { data: mfaConfig } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('method_type', method)
        .eq('status', 'active')
        .single();

      if (!mfaConfig) {
        return {
          verified: false,
          method,
          requiresNewMethod: true,
          reason: 'MFA not configured'
        };
      }

      let verified = false;
      let isBackupCode = false;

      if (method === 'totp') {
        // Verify TOTP token
        const secret = this.decryptSecret(mfaConfig.secret_encrypted);
        verified = speakeasy.totp.verify({
          secret,
          encoding: 'base32',
          token,
          window: this.MFA_CODE_VALIDITY_WINDOW / 30
        });

        // If TOTP fails, try backup codes
        if (!verified) {
          const backupCodes = this.decryptBackupCodes(mfaConfig.backup_codes_encrypted);
          const codeIndex = backupCodes.indexOf(token.toUpperCase());
          
          if (codeIndex !== -1) {
            verified = true;
            isBackupCode = true;
            
            // Remove used backup code
            backupCodes.splice(codeIndex, 1);
            await supabaseAdmin
              .from('mfa_configs')
              .update({
                backup_codes_encrypted: this.encryptBackupCodes(backupCodes),
                updated_at: new Date().toISOString()
              })
              .eq('id', mfaConfig.id);
          }
        }
      }

      if (verified) {
        // Reset failed attempts on success
        await supabaseAdmin
          .from('mfa_configs')
          .update({
            failed_attempts: 0,
            last_verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', mfaConfig.id);

        // Log successful MFA verification
        await complianceMonitor.logSecurityEvent({
          organizationId: mfaConfig.organization_id,
          userId,
          eventType: 'suspicious_login', // This would be mfa_verification_success in production
          severity: 'low',
          source: 'mfa_manager',
          description: `MFA verification successful using ${isBackupCode ? 'backup code' : method}`,
          riskScore: 10,
          metadata: { 
            method, 
            isBackupCode, 
            sessionId,
            configId: mfaConfig.id 
          }
        });

        return {
          verified: true,
          method
        };
      } else {
        // Increment failed attempts
        const failedAttempts = (mfaConfig.failed_attempts || 0) + 1;
        await supabaseAdmin
          .from('mfa_configs')
          .update({
            failed_attempts: failedAttempts,
            updated_at: new Date().toISOString()
          })
          .eq('id', mfaConfig.id);

        // Log failed MFA attempt
        await complianceMonitor.logSecurityEvent({
          organizationId: mfaConfig.organization_id,
          userId,
          eventType: 'authentication_failure',
          severity: 'medium',
          source: 'mfa_manager',
          description: 'MFA verification failed',
          riskScore: 40,
          metadata: { 
            method, 
            failedAttempts, 
            sessionId,
            configId: mfaConfig.id 
          }
        });

        return {
          verified: false,
          method,
          remainingAttempts: Math.max(0, this.MAX_ATTEMPTS_PER_SESSION - failedAttempts),
          reason: 'Invalid MFA code'
        };
      }

    } catch (error) {
      console.error('Error verifying MFA:', error);
      return {
        verified: false,
        method,
        reason: 'MFA verification failed'
      };
    }
  }

  /**
   * Generate new backup codes
   */
  async generateNewBackupCodes(userId: string): Promise<string[]> {
    try {
      // Check if user has permission to generate backup codes
      const canManageMFA = await permissionManager.checkPermission(userId, 'profile.manage_security');
      if (!canManageMFA) {
        throw new Error('Insufficient permissions to generate backup codes');
      }

      // Get active MFA configuration
      const { data: mfaConfig } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('method_type', 'totp')
        .eq('status', 'active')
        .single();

      if (!mfaConfig) {
        throw new Error('TOTP MFA not configured');
      }

      // Generate new backup codes
      const backupCodes = Array.from({ length: this.BACKUP_CODES_COUNT }, () => 
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Update backup codes in database
      await supabaseAdmin
        .from('mfa_configs')
        .update({
          backup_codes_encrypted: this.encryptBackupCodes(backupCodes),
          updated_at: new Date().toISOString()
        })
        .eq('id', mfaConfig.id);

      // Log backup code regeneration
      await complianceMonitor.logSecurityEvent({
        organizationId: mfaConfig.organization_id,
        userId,
        eventType: 'admin_action_unusual',
        severity: 'low',
        source: 'mfa_manager',
        description: 'MFA backup codes regenerated',
        riskScore: 20,
        metadata: { 
          method: 'totp',
          codesGenerated: backupCodes.length,
          configId: mfaConfig.id 
        }
      });

      return backupCodes;

    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw error;
    }
  }

  /**
   * Disable MFA for user
   */
  async disableMFA(userId: string, adminUserId?: string): Promise<void> {
    try {
      // Check permissions
      if (adminUserId && adminUserId !== userId) {
        const canManageUsers = await permissionManager.checkPermission(adminUserId, 'users.manage');
        if (!canManageUsers) {
          throw new Error('Insufficient permissions to disable MFA for other users');
        }
      }

      // Get MFA configuration
      const { data: mfaConfig } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!mfaConfig) {
        throw new Error('No active MFA configuration found');
      }

      // Disable MFA
      await supabaseAdmin
        .from('mfa_configs')
        .update({
          status: 'disabled',
          disabled_at: new Date().toISOString(),
          disabled_by: adminUserId || userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', mfaConfig.id);

      // Log MFA disable action
      await complianceMonitor.logSecurityEvent({
        organizationId: mfaConfig.organization_id,
        userId,
        eventType: 'admin_action_unusual',
        severity: adminUserId && adminUserId !== userId ? 'high' : 'medium',
        source: 'mfa_manager',
        description: `MFA disabled ${adminUserId && adminUserId !== userId ? 'by admin' : 'by user'}`,
        riskScore: adminUserId && adminUserId !== userId ? 60 : 40,
        metadata: { 
          method: mfaConfig.method_type,
          disabledBy: adminUserId || userId,
          configId: mfaConfig.id 
        }
      });

    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw error;
    }
  }

  /**
   * Get MFA status for user
   */
  async getMFAStatus(userId: string): Promise<{
    enabled: boolean;
    methods: string[];
    backupCodesRemaining?: number;
    lastVerified?: Date;
    setupRequired: boolean;
  }> {
    try {
      const { data: mfaConfigs } = await supabase
        .from('mfa_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      const methods = mfaConfigs?.map(config => config.method_type) || [];
      const totpConfig = mfaConfigs?.find(config => config.method_type === 'totp');
      
      let backupCodesRemaining: number | undefined;
      if (totpConfig) {
        const backupCodes = this.decryptBackupCodes(totpConfig.backup_codes_encrypted);
        backupCodesRemaining = backupCodes.length;
      }

      // Check if MFA setup is required
      const mfaRequirement = await this.checkMFARequirement(userId, 'general');

      return {
        enabled: methods.length > 0,
        methods,
        backupCodesRemaining,
        lastVerified: totpConfig?.last_verified_at ? new Date(totpConfig.last_verified_at) : undefined,
        setupRequired: mfaRequirement.requiresMFA && methods.length === 0
      };

    } catch (error) {
      console.error('Error getting MFA status:', error);
      return {
        enabled: false,
        methods: [],
        setupRequired: false
      };
    }
  }

  /**
   * Check account lockout status
   */
  private async checkAccountLockout(userId: string): Promise<{
    locked: boolean;
    lockoutUntil?: Date;
    failedAttempts: number;
  }> {
    try {
      const { data: mfaConfig } = await supabase
        .from('mfa_configs')
        .select('failed_attempts, locked_until')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!mfaConfig) {
        return { locked: false, failedAttempts: 0 };
      }

      const failedAttempts = mfaConfig.failed_attempts || 0;
      const lockedUntil = mfaConfig.locked_until ? new Date(mfaConfig.locked_until) : null;

      // Check if account should be locked
      if (failedAttempts >= this.MAX_ATTEMPTS_PER_SESSION) {
        const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
        
        // Update lockout status if not already set
        if (!lockedUntil || lockedUntil < new Date()) {
          await supabaseAdmin
            .from('mfa_configs')
            .update({ 
              locked_until: lockoutUntil.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('status', 'active');
          
          return {
            locked: true,
            lockoutUntil,
            failedAttempts
          };
        }
      }

      // Check if lockout period has expired
      if (lockedUntil && lockedUntil > new Date()) {
        return {
          locked: true,
          lockoutUntil: lockedUntil,
          failedAttempts
        };
      }

      return {
        locked: false,
        failedAttempts
      };

    } catch (error) {
      console.error('Error checking account lockout:', error);
      return { locked: false, failedAttempts: 0 };
    }
  }

  /**
   * Get grace period expiry for MFA requirement
   */
  private async getGracePeriodExpiry(userId: string, organizationId: string): Promise<Date | null> {
    try {
      const { data: gracePeriod } = await supabase
        .from('mfa_grace_periods')
        .select('expires_at')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

      return gracePeriod ? new Date(gracePeriod.expires_at) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Encrypt secret for storage
   */
  private encryptSecret(secret: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.MFA_ENCRYPTION_KEY || 'fallback-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt secret from storage
   */
  private decryptSecret(encryptedSecret: string): string {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.MFA_ENCRYPTION_KEY || 'fallback-key', 'salt', 32);
    
    const [ivHex, encrypted] = encryptedSecret.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Encrypt backup codes for storage
   */
  private encryptBackupCodes(codes: string[]): string {
    return this.encryptSecret(JSON.stringify(codes));
  }

  /**
   * Decrypt backup codes from storage
   */
  private decryptBackupCodes(encryptedCodes: string): string[] {
    try {
      const decrypted = this.decryptSecret(encryptedCodes);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting backup codes:', error);
      return [];
    }
  }

  /**
   * Start MFA cleanup background process
   */
  private startMFACleanup(): void {
    // Clean up expired sessions and unlock accounts every 15 minutes
    setInterval(async () => {
      try {
        await this.cleanupExpiredSessions();
        await this.unlockExpiredAccounts();
      } catch (error) {
        console.error('MFA cleanup error:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
  }

  /**
   * Clean up expired MFA sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const expiredThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

    await supabaseAdmin
      .from('mfa_configs')
      .delete()
      .eq('status', 'pending_verification')
      .lt('created_at', expiredThreshold.toISOString());
  }

  /**
   * Unlock accounts with expired lockout periods
   */
  private async unlockExpiredAccounts(): Promise<void> {
    await supabaseAdmin
      .from('mfa_configs')
      .update({ 
        locked_until: null, 
        failed_attempts: 0,
        updated_at: new Date().toISOString()
      })
      .lt('locked_until', new Date().toISOString())
      .not('locked_until', 'is', null);
  }
}

// Export singleton instance
export const mfaManager = EnterpriseMFAManager.getInstance();