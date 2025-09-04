// Enterprise Security Types and Interfaces
// PrismForge AI - Comprehensive Security Framework Types

export interface SecurityConfiguration {
  rateLimiting: {
    enabled: boolean;
    rulesPerEndpoint: Record<string, RateLimitRule>;
    globalLimits: RateLimitRule;
    whitelist?: string[];
  };
  ipWhitelisting: {
    enabled: boolean;
    allowedIPs: string[];
    allowedCIDRs: string[];
    blockUnknownIPs: boolean;
    geoRestrictions?: GeoRestriction[];
  };
  deviceFingerprinting: {
    enabled: boolean;
    requireRegistration: boolean;
    maxDevicesPerUser: number;
    deviceTrustLevel: 'strict' | 'moderate' | 'permissive';
  };
  mfa: {
    enabled: boolean;
    requiredForRoles: string[];
    methods: MFAMethod[];
    gracePeriodHours: number;
    backupCodeCount: number;
  };
  encryption: {
    atRest: {
      enabled: boolean;
      algorithm: string;
      keyRotationIntervalDays: number;
    };
    inTransit: {
      enforceHTTPS: boolean;
      tlsVersion: string;
      hstsSecurity: boolean;
    };
  };
  compliance: {
    soc2: boolean;
    gdpr: boolean;
    sox: boolean;
    ffiec: boolean;
    auditRetentionDays: number;
    dataClassification: boolean;
  };
  zeroTrust: {
    enabled: boolean;
    continuousVerification: boolean;
    riskBasedAccess: boolean;
    minimumPrivilege: boolean;
  };
}

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: string;
  message?: string;
  statusCode?: number;
}

export interface GeoRestriction {
  countryCode: string;
  allowed: boolean;
  reason: string;
}

export interface DeviceFingerprint {
  id: string;
  userId: string;
  organizationId: string;
  fingerprint: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    browser: string;
    version: string;
    screenResolution: string;
    timezone: string;
    language: string;
    hardwareInfo: any;
  };
  trustLevel: 'trusted' | 'unknown' | 'suspicious' | 'blocked';
  firstSeen: Date;
  lastSeen: Date;
  verificationStatus: 'verified' | 'pending' | 'failed';
  riskScore: number; // 0-100
  metadata: any;
}

export interface MFAMethod {
  type: 'totp' | 'sms' | 'email' | 'hardware' | 'biometric';
  enabled: boolean;
  priority: number;
  configuration: any;
}

export interface MFASession {
  id: string;
  userId: string;
  method: string;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  verified: boolean;
  createdAt: Date;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export interface SecurityEvent {
  id: string;
  organizationId: string;
  userId?: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: GeoLocation;
  riskScore: number;
  mitigationActions: string[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  metadata: any;
  detectedAt: Date;
  resolvedAt?: Date;
}

export type SecurityEventType =
  | 'authentication_failure'
  | 'suspicious_login'
  | 'rate_limit_exceeded'
  | 'unauthorized_access_attempt'
  | 'data_export_unusual'
  | 'privilege_escalation'
  | 'suspicious_device'
  | 'geo_anomaly'
  | 'mfa_bypass_attempt'
  | 'session_hijacking'
  | 'injection_attempt'
  | 'compliance_violation'
  | 'data_breach_attempt'
  | 'admin_action_unusual';

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isp: string;
  organization: string;
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  reportType: 'soc2' | 'gdpr' | 'sox' | 'ffiec' | 'security_assessment';
  periodStart: Date;
  periodEnd: Date;
  status: 'draft' | 'review' | 'approved' | 'submitted';
  findings: ComplianceFinding[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  generatedAt: Date;
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  metadata: any;
}

export interface ComplianceFinding {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  evidence: any[];
  remediation: string;
  dueDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptionMetadata {
  algorithm: string;
  keyVersion: string;
  encryptedAt: Date;
  encryptedBy: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  retentionPolicy?: string;
}

export interface AuditContext {
  organizationId: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  location?: GeoLocation;
  requestId?: string;
  endpoint?: string;
  method?: string;
}

export interface SecurityHeaders {
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

export interface ZeroTrustPolicy {
  id: string;
  name: string;
  description: string;
  conditions: ZeroTrustCondition[];
  actions: ZeroTrustAction[];
  priority: number;
  enabled: boolean;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ZeroTrustCondition {
  type: 'user_role' | 'device_trust' | 'location' | 'time' | 'risk_score' | 'resource_sensitivity';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

export interface ZeroTrustAction {
  type: 'allow' | 'deny' | 'require_mfa' | 'require_approval' | 'log_warning' | 'increase_monitoring';
  parameters: any;
}

export interface RiskAssessment {
  userId: string;
  sessionId: string;
  riskScore: number; // 0-100
  riskFactors: RiskFactor[];
  recommendation: 'allow' | 'challenge' | 'block';
  calculatedAt: Date;
  validUntil: Date;
}

export interface RiskFactor {
  type: 'location' | 'device' | 'behavior' | 'time' | 'velocity' | 'reputation';
  score: number; // 0-100
  weight: number; // 0-1
  description: string;
  confidence: number; // 0-1
}

// Request validation schemas
export interface APIRequestValidation {
  endpoint: string;
  method: string;
  requiredHeaders: string[];
  allowedContentTypes: string[];
  maxBodySize: number;
  requireAuthentication: boolean;
  requiredPermissions: string[];
  rateLimitRule?: RateLimitRule;
  customValidation?: (req: any) => Promise<boolean>;
}

// Security monitoring alerts
export interface SecurityAlert {
  id: string;
  organizationId: string;
  alertType: 'threshold_exceeded' | 'anomaly_detected' | 'compliance_violation' | 'security_incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedUsers: string[];
  affectedResources: string[];
  triggerConditions: any;
  recommendedActions: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  createdAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  metadata: any;
}