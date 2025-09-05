// Enterprise Data Encryption Validation Service
// PrismForge AI - Encryption at Rest and in Transit Validation

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { EncryptionMetadata, SecurityEvent, ComplianceFinding } from '@/types/security.types';
import { complianceMonitor } from './compliance-monitoring';
import crypto from 'crypto';
import { NextRequest } from 'next/server';

interface EncryptionConfig {
  atRest: {
    algorithm: string;
    keySize: number;
    mode: string;
    keyRotationIntervalDays: number;
    enableKeyVersioning: boolean;
  };
  inTransit: {
    tlsVersion: string;
    cipherSuites: string[];
    enforceHSTS: boolean;
    requireClientCert: boolean;
  };
  dataClassification: {
    public: { encryptionRequired: boolean };
    internal: { encryptionRequired: boolean; algorithm?: string };
    confidential: { encryptionRequired: boolean; algorithm: string };
    restricted: { encryptionRequired: boolean; algorithm: string; keyRotationDays: number };
  };
}

interface EncryptionValidationResult {
  valid: boolean;
  issues: EncryptionIssue[];
  riskScore: number;
  recommendations: string[];
  compliance: {
    soc2: boolean;
    gdpr: boolean;
    sox: boolean;
    ffiec: boolean;
  };
}

interface EncryptionIssue {
  type: 'algorithm_weak' | 'key_rotation_overdue' | 'tls_version_outdated' | 'data_unencrypted' | 'key_management';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  affectedData?: string[];
}

interface DataEncryptionRequest {
  data: any;
  dataType: string;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  organizationId: string;
  userId?: string;
  metadata?: any;
}

interface EncryptedData {
  encryptedData: string;
  keyId: string;
  algorithm: string;
  iv: string;
  authTag?: string;
  metadata: EncryptionMetadata;
}

export class EnterpriseEncryptionValidator {
  private static instance: EnterpriseEncryptionValidator;
  private encryptionKeys: Map<string, { key: Buffer; version: string; createdAt: Date }> = new Map();
  private readonly DEFAULT_ALGORITHM = 'aes-256-gcm';
  private readonly KEY_ROTATION_DAYS = 90;

  constructor() {
    this.initializeEncryptionKeys();
    this.startKeyRotationMonitoring();
  }

  static getInstance(): EnterpriseEncryptionValidator {
    if (!this.instance) {
      this.instance = new EnterpriseEncryptionValidator();
    }
    return this.instance;
  }

  /**
   * Get encryption configuration for organization
   */
  async getEncryptionConfig(organizationId: string): Promise<EncryptionConfig> {
    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      const securitySettings = org?.security_settings || {};
      
      return {
        atRest: {
          algorithm: securitySettings.encryption?.atRest?.algorithm || 'aes-256-gcm',
          keySize: securitySettings.encryption?.atRest?.keySize || 256,
          mode: securitySettings.encryption?.atRest?.mode || 'gcm',
          keyRotationIntervalDays: securitySettings.encryption?.atRest?.keyRotationIntervalDays || this.KEY_ROTATION_DAYS,
          enableKeyVersioning: securitySettings.encryption?.atRest?.enableKeyVersioning ?? true
        },
        inTransit: {
          tlsVersion: securitySettings.encryption?.inTransit?.tlsVersion || 'TLSv1.3',
          cipherSuites: securitySettings.encryption?.inTransit?.cipherSuites || [
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_128_GCM_SHA256'
          ],
          enforceHSTS: securitySettings.encryption?.inTransit?.enforceHSTS ?? true,
          requireClientCert: securitySettings.encryption?.inTransit?.requireClientCert ?? false
        },
        dataClassification: {
          public: { encryptionRequired: false },
          internal: { encryptionRequired: true },
          confidential: { 
            encryptionRequired: true, 
            algorithm: 'aes-256-gcm' 
          },
          restricted: { 
            encryptionRequired: true, 
            algorithm: 'aes-256-gcm',
            keyRotationDays: 30
          }
        }
      };

    } catch (error) {
      console.error('Error getting encryption config:', error);
      // Return secure defaults
      return this.getDefaultEncryptionConfig();
    }
  }

  /**
   * Validate encryption compliance for organization
   */
  async validateEncryptionCompliance(organizationId: string): Promise<EncryptionValidationResult> {
    try {
      const config = await this.getEncryptionConfig(organizationId);
      const issues: EncryptionIssue[] = [];
      let riskScore = 0;

      // Validate encryption at rest
      const atRestIssues = await this.validateEncryptionAtRest(organizationId, config);
      issues.push(...atRestIssues);

      // Validate encryption in transit
      const inTransitIssues = await this.validateEncryptionInTransit(organizationId, config);
      issues.push(...inTransitIssues);

      // Validate key management
      const keyMgmtIssues = await this.validateKeyManagement(organizationId, config);
      issues.push(...keyMgmtIssues);

      // Validate data classification compliance
      const classificationIssues = await this.validateDataClassificationCompliance(organizationId, config);
      issues.push(...classificationIssues);

      // Calculate risk score
      riskScore = this.calculateRiskScore(issues);

      // Generate recommendations
      const recommendations = this.generateEncryptionRecommendations(issues, config);

      // Check compliance with frameworks
      const compliance = this.checkFrameworkCompliance(issues, config);

      // Log compliance validation
      await this.logEncryptionValidation(organizationId, issues, riskScore);

      return {
        valid: issues.length === 0,
        issues,
        riskScore,
        recommendations,
        compliance
      };

    } catch (error) {
      console.error('Error validating encryption compliance:', error);
      throw error;
    }
  }

  /**
   * Encrypt data based on classification
   */
  async encryptData(request: DataEncryptionRequest): Promise<EncryptedData> {
    try {
      const config = await this.getEncryptionConfig(request.organizationId);
      const classificationConfig = config.dataClassification[request.classification];

      // Check if encryption is required
      if (!classificationConfig.encryptionRequired) {
        // For non-encrypted data, still create metadata for tracking
        return {
          encryptedData: JSON.stringify(request.data),
          keyId: 'none',
          algorithm: 'none',
          iv: '',
          metadata: {
            algorithm: 'none',
            keyVersion: '1',
            encryptedAt: new Date(),
            encryptedBy: request.userId || 'system',
            dataClassification: request.classification
          }
        };
      }

      const algorithm = ('algorithm' in classificationConfig && classificationConfig.algorithm) || config.atRest.algorithm;
      const keyId = `${request.organizationId}_${request.classification}`;
      const key = await this.getOrCreateEncryptionKey(keyId, request.organizationId);

      // Encrypt the data
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(algorithm, key.key);
      
      let encrypted = cipher.update(JSON.stringify(request.data), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = (cipher as any).getAuthTag?.() ? (cipher as any).getAuthTag().toString('hex') : undefined;

      const encryptedData: EncryptedData = {
        encryptedData: encrypted,
        keyId,
        algorithm,
        iv: iv.toString('hex'),
        authTag,
        metadata: {
          algorithm,
          keyVersion: key.version,
          encryptedAt: new Date(),
          encryptedBy: request.userId || 'system',
          dataClassification: request.classification,
          retentionPolicy: this.getRetentionPolicy(request.classification)
        }
      };

      // Store encryption record for audit
      await this.recordEncryptionOperation({
        organizationId: request.organizationId,
        userId: request.userId,
        operation: 'encrypt',
        dataType: request.dataType,
        classification: request.classification,
        algorithm,
        keyId,
        success: true
      });

      return encryptedData;

    } catch (error) {
      console.error('Error encrypting data:', error);
      
      // Log failed encryption attempt
      await this.recordEncryptionOperation({
        organizationId: request.organizationId,
        userId: request.userId,
        operation: 'encrypt',
        dataType: request.dataType,
        classification: request.classification,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Decrypt data
   */
  async decryptData(
    encryptedData: EncryptedData,
    organizationId: string,
    userId?: string
  ): Promise<any> {
    try {
      // Handle unencrypted data
      if (encryptedData.algorithm === 'none') {
        return JSON.parse(encryptedData.encryptedData);
      }

      const key = await this.getEncryptionKey(encryptedData.keyId, organizationId);
      if (!key) {
        throw new Error(`Encryption key not found: ${encryptedData.keyId}`);
      }

      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipher(encryptedData.algorithm, key.key);
      
      if (encryptedData.authTag) {
        (decipher as any).setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      }

      let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      // Log successful decryption
      await this.recordEncryptionOperation({
        organizationId,
        userId,
        operation: 'decrypt',
        classification: encryptedData.metadata.dataClassification,
        algorithm: encryptedData.algorithm,
        keyId: encryptedData.keyId,
        success: true
      });

      return JSON.parse(decrypted);

    } catch (error) {
      console.error('Error decrypting data:', error);
      
      // Log failed decryption attempt
      await this.recordEncryptionOperation({
        organizationId,
        userId,
        operation: 'decrypt',
        keyId: encryptedData.keyId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Validate TLS/SSL configuration for incoming requests
   */
  async validateRequestEncryption(request: NextRequest, organizationId: string): Promise<{
    valid: boolean;
    issues: string[];
    tlsVersion?: string;
    cipherSuite?: string;
    riskScore: number;
  }> {
    try {
      const config = await this.getEncryptionConfig(organizationId);
      const issues: string[] = [];
      let riskScore = 0;

      // Check if request is over HTTPS
      if (request.url.startsWith('http:')) {
        issues.push('Request not using HTTPS - data transmitted in plaintext');
        riskScore += 50;
      }

      // Check TLS version from headers (if available)
      const tlsVersion = request.headers.get('x-forwarded-proto-version') || 
                        request.headers.get('x-tls-version');
      
      if (tlsVersion) {
        const minTLSVersion = config.inTransit.tlsVersion;
        if (this.compareTLSVersions(tlsVersion, minTLSVersion) < 0) {
          issues.push(`TLS version ${tlsVersion} below minimum required ${minTLSVersion}`);
          riskScore += 30;
        }
      }

      // Check for security headers
      const securityHeaders = [
        'strict-transport-security',
        'x-content-type-options',
        'x-frame-options'
      ];

      securityHeaders.forEach(header => {
        if (!request.headers.get(header)) {
          issues.push(`Missing security header: ${header}`);
          riskScore += 10;
        }
      });

      // Check cipher suite (if available)
      const cipherSuite = request.headers.get('x-cipher-suite');
      if (cipherSuite && !config.inTransit.cipherSuites.includes(cipherSuite)) {
        issues.push(`Weak cipher suite: ${cipherSuite}`);
        riskScore += 20;
      }

      return {
        valid: issues.length === 0,
        issues,
        tlsVersion: tlsVersion || undefined,
        cipherSuite: cipherSuite || undefined,
        riskScore
      };

    } catch (error) {
      console.error('Error validating request encryption:', error);
      return {
        valid: false,
        issues: ['Encryption validation failed'],
        riskScore: 100
      };
    }
  }

  /**
   * Rotate encryption keys
   */
  async rotateEncryptionKey(keyId: string, organizationId: string): Promise<void> {
    try {
      // Generate new key
      const newKey = crypto.randomBytes(32);
      const newVersion = Date.now().toString();
      
      // Store old key for decryption of existing data
      const oldKey = this.encryptionKeys.get(keyId);
      if (oldKey) {
        this.encryptionKeys.set(`${keyId}_${oldKey.version}`, oldKey);
      }

      // Store new key
      this.encryptionKeys.set(keyId, {
        key: newKey,
        version: newVersion,
        createdAt: new Date()
      });

      // Log key rotation
      await complianceMonitor.logSecurityEvent({
        organizationId,
        eventType: 'admin_action_unusual',
        severity: 'low',
        source: 'encryption_validator',
        description: `Encryption key rotated: ${keyId}`,
        riskScore: 10,
        metadata: {
          keyId,
          newVersion,
          rotatedAt: new Date()
        }
      });

      // Update database record
      await supabaseAdmin
        .from('encryption_keys')
        .upsert({
          key_id: keyId,
          organization_id: organizationId,
          version: newVersion,
          created_at: new Date().toISOString(),
          status: 'active'
        });

      console.log(`Encryption key rotated: ${keyId} -> version ${newVersion}`);

    } catch (error) {
      console.error('Error rotating encryption key:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private getDefaultEncryptionConfig(): EncryptionConfig {
    return {
      atRest: {
        algorithm: 'aes-256-gcm',
        keySize: 256,
        mode: 'gcm',
        keyRotationIntervalDays: 90,
        enableKeyVersioning: true
      },
      inTransit: {
        tlsVersion: 'TLSv1.3',
        cipherSuites: [
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256'
        ],
        enforceHSTS: true,
        requireClientCert: false
      },
      dataClassification: {
        public: { encryptionRequired: false },
        internal: { encryptionRequired: true },
        confidential: { encryptionRequired: true, algorithm: 'aes-256-gcm' },
        restricted: { encryptionRequired: true, algorithm: 'aes-256-gcm', keyRotationDays: 30 }
      }
    };
  }

  private async validateEncryptionAtRest(
    organizationId: string,
    config: EncryptionConfig
  ): Promise<EncryptionIssue[]> {
    const issues: EncryptionIssue[] = [];

    // Check if weak algorithms are being used
    const weakAlgorithms = ['aes-128-cbc', 'des', '3des', 'rc4'];
    if (weakAlgorithms.includes(config.atRest.algorithm.toLowerCase())) {
      issues.push({
        type: 'algorithm_weak',
        severity: 'high',
        description: `Weak encryption algorithm in use: ${config.atRest.algorithm}`,
        remediation: 'Upgrade to AES-256-GCM or ChaCha20-Poly1305'
      });
    }

    // Check key rotation
    const keyRotationIssues = await this.checkKeyRotationStatus(organizationId, config);
    issues.push(...keyRotationIssues);

    return issues;
  }

  private async validateEncryptionInTransit(
    organizationId: string,
    config: EncryptionConfig
  ): Promise<EncryptionIssue[]> {
    const issues: EncryptionIssue[] = [];

    // Check TLS version
    const outdatedVersions = ['TLSv1.0', 'TLSv1.1', 'SSLv3', 'SSLv2'];
    if (outdatedVersions.includes(config.inTransit.tlsVersion)) {
      issues.push({
        type: 'tls_version_outdated',
        severity: 'critical',
        description: `Outdated TLS version: ${config.inTransit.tlsVersion}`,
        remediation: 'Upgrade to TLS 1.2 or 1.3'
      });
    }

    // Check cipher suites
    const weakCiphers = config.inTransit.cipherSuites.filter(cipher => 
      cipher.includes('RC4') || cipher.includes('DES') || cipher.includes('MD5')
    );

    if (weakCiphers.length > 0) {
      issues.push({
        type: 'algorithm_weak',
        severity: 'high',
        description: `Weak cipher suites configured: ${weakCiphers.join(', ')}`,
        remediation: 'Remove weak cipher suites and use only strong ciphers'
      });
    }

    return issues;
  }

  private async validateKeyManagement(
    organizationId: string,
    config: EncryptionConfig
  ): Promise<EncryptionIssue[]> {
    const issues: EncryptionIssue[] = [];

    // Check if key versioning is enabled
    if (!config.atRest.enableKeyVersioning) {
      issues.push({
        type: 'key_management',
        severity: 'medium',
        description: 'Key versioning is disabled',
        remediation: 'Enable key versioning for better key lifecycle management'
      });
    }

    return issues;
  }

  private async validateDataClassificationCompliance(
    organizationId: string,
    config: EncryptionConfig
  ): Promise<EncryptionIssue[]> {
    const issues: EncryptionIssue[] = [];

    // Check if confidential data requires encryption
    if (!config.dataClassification.confidential.encryptionRequired) {
      issues.push({
        type: 'data_unencrypted',
        severity: 'critical',
        description: 'Confidential data classification does not require encryption',
        remediation: 'Enable encryption requirement for confidential data'
      });
    }

    // Check if restricted data has appropriate key rotation
    const restrictedConfig = config.dataClassification.restricted;
    if (restrictedConfig.keyRotationDays > 90) {
      issues.push({
        type: 'key_rotation_overdue',
        severity: 'medium',
        description: `Restricted data key rotation interval too long: ${restrictedConfig.keyRotationDays} days`,
        remediation: 'Set key rotation interval to 30 days or less for restricted data'
      });
    }

    return issues;
  }

  private async checkKeyRotationStatus(
    organizationId: string,
    config: EncryptionConfig
  ): Promise<EncryptionIssue[]> {
    const issues: EncryptionIssue[] = [];

    try {
      const { data: keys } = await supabase
        .from('encryption_keys')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (!keys) return issues;

      const rotationInterval = config.atRest.keyRotationIntervalDays * 24 * 60 * 60 * 1000;
      const now = Date.now();

      keys.forEach(key => {
        const keyAge = now - new Date(key.created_at).getTime();
        if (keyAge > rotationInterval) {
          issues.push({
            type: 'key_rotation_overdue',
            severity: 'medium',
            description: `Encryption key overdue for rotation: ${key.key_id}`,
            remediation: `Rotate key ${key.key_id} immediately`,
            affectedData: [key.key_id]
          });
        }
      });

    } catch (error) {
      console.error('Error checking key rotation status:', error);
    }

    return issues;
  }

  private calculateRiskScore(issues: EncryptionIssue[]): number {
    let score = 0;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score += 40;
          break;
        case 'high':
          score += 25;
          break;
        case 'medium':
          score += 15;
          break;
        case 'low':
          score += 5;
          break;
      }
    });

    return Math.min(100, score);
  }

  private generateEncryptionRecommendations(
    issues: EncryptionIssue[],
    config: EncryptionConfig
  ): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.type === 'algorithm_weak')) {
      recommendations.push('Upgrade to modern encryption algorithms (AES-256-GCM, ChaCha20-Poly1305)');
    }

    if (issues.some(i => i.type === 'tls_version_outdated')) {
      recommendations.push('Upgrade to TLS 1.3 for optimal security and performance');
    }

    if (issues.some(i => i.type === 'key_rotation_overdue')) {
      recommendations.push('Implement automated key rotation schedule');
    }

    if (issues.some(i => i.type === 'data_unencrypted')) {
      recommendations.push('Enable encryption for all sensitive data classifications');
    }

    return recommendations;
  }

  private checkFrameworkCompliance(
    issues: EncryptionIssue[],
    config: EncryptionConfig
  ): { soc2: boolean; gdpr: boolean; sox: boolean; ffiec: boolean } {
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const hasStrongEncryption = config.atRest.algorithm === 'aes-256-gcm';
    const hasKeyRotation = config.atRest.keyRotationIntervalDays <= 90;

    return {
      soc2: criticalIssues.length === 0 && hasStrongEncryption && hasKeyRotation,
      gdpr: criticalIssues.length === 0 && hasStrongEncryption,
      sox: criticalIssues.length === 0 && hasStrongEncryption && hasKeyRotation,
      ffiec: criticalIssues.length === 0 && hasStrongEncryption && config.atRest.keyRotationIntervalDays <= 90
    };
  }

  private async getOrCreateEncryptionKey(
    keyId: string,
    organizationId: string
  ): Promise<{ key: Buffer; version: string }> {
    let key = this.encryptionKeys.get(keyId);
    
    if (!key) {
      // Generate new key
      const keyBuffer = crypto.randomBytes(32);
      const version = Date.now().toString();
      
      key = {
        key: keyBuffer,
        version,
        createdAt: new Date()
      };

      this.encryptionKeys.set(keyId, key);

      // Store in database
      await supabaseAdmin
        .from('encryption_keys')
        .upsert({
          key_id: keyId,
          organization_id: organizationId,
          version,
          created_at: new Date().toISOString(),
          status: 'active'
        });
    }

    return key;
  }

  private async getEncryptionKey(
    keyId: string,
    organizationId: string
  ): Promise<{ key: Buffer; version: string } | null> {
    return this.encryptionKeys.get(keyId) || null;
  }

  private getRetentionPolicy(classification: string): string {
    const policies = {
      public: '1 year',
      internal: '3 years',
      confidential: '7 years',
      restricted: '10 years'
    };
    return policies[classification as keyof typeof policies] || '3 years';
  }

  private compareTLSVersions(version1: string, version2: string): number {
    const versions = {
      'SSLv2': 0,
      'SSLv3': 1,
      'TLSv1.0': 2,
      'TLSv1.1': 3,
      'TLSv1.2': 4,
      'TLSv1.3': 5
    };

    const v1 = versions[version1 as keyof typeof versions] || 0;
    const v2 = versions[version2 as keyof typeof versions] || 0;

    return v1 - v2;
  }

  private async recordEncryptionOperation(operation: {
    organizationId: string;
    userId?: string;
    operation: 'encrypt' | 'decrypt';
    dataType?: string;
    classification?: string;
    algorithm?: string;
    keyId?: string;
    success: boolean;
    error?: string;
  }): Promise<void> {
    try {
      await supabaseAdmin
        .from('encryption_operations')
        .insert({
          organization_id: operation.organizationId,
          user_id: operation.userId,
          operation: operation.operation,
          data_type: operation.dataType,
          classification: operation.classification,
          algorithm: operation.algorithm,
          key_id: operation.keyId,
          success: operation.success,
          error_message: operation.error,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error recording encryption operation:', error);
    }
  }

  private async logEncryptionValidation(
    organizationId: string,
    issues: EncryptionIssue[],
    riskScore: number
  ): Promise<void> {
    await complianceMonitor.logSecurityEvent({
      organizationId,
      eventType: 'compliance_violation',
      severity: riskScore > 50 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      source: 'encryption_validator',
      description: `Encryption compliance validation completed with ${issues.length} issues`,
      riskScore,
      metadata: {
        issuesFound: issues.length,
        criticalIssues: issues.filter(i => i.severity === 'critical').length,
        highIssues: issues.filter(i => i.severity === 'high').length,
        issues: issues.map(i => ({ type: i.type, severity: i.severity }))
      }
    });
  }

  private initializeEncryptionKeys(): void {
    // Initialize with a master key from environment
    if (process.env.MASTER_ENCRYPTION_KEY) {
      const masterKey = Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'hex');
      this.encryptionKeys.set('master', {
        key: masterKey,
        version: '1',
        createdAt: new Date()
      });
    }
  }

  private startKeyRotationMonitoring(): void {
    // Check for key rotation requirements daily
    setInterval(async () => {
      try {
        await this.checkAllKeyRotations();
      } catch (error) {
        console.error('Key rotation monitoring error:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  private async checkAllKeyRotations(): Promise<void> {
    try {
      const { data: keys } = await supabase
        .from('encryption_keys')
        .select('*')
        .eq('status', 'active');

      if (!keys) return;

      const now = Date.now();
      const rotationThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days

      for (const key of keys) {
        const keyAge = now - new Date(key.created_at).getTime();
        if (keyAge > rotationThreshold) {
          console.warn(`Key rotation required for: ${key.key_id}`);
          // In production, this would trigger automated key rotation
        }
      }
    } catch (error) {
      console.error('Error checking key rotations:', error);
    }
  }
}

// Export singleton instance
export const encryptionValidator = EnterpriseEncryptionValidator.getInstance();