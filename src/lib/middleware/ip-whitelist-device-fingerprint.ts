// Enterprise IP Whitelisting and Device Fingerprinting Middleware
// PrismForge AI - Advanced Device Security and Access Control

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { DeviceFingerprint, GeoLocation, SecurityEvent, SecurityConfiguration } from '@/types/security.types';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

interface IPWhitelistRule {
  organizationId: string;
  allowedIPs: string[];
  allowedCIDRs: string[];
  blockUnknownIPs: boolean;
  geoRestrictions: GeoRestriction[];
  emergencyBypass: boolean;
}

interface GeoRestriction {
  countryCode: string;
  allowed: boolean;
  reason: string;
}

interface DeviceAnalysis {
  fingerprint: string;
  trustScore: number; // 0-100
  riskFactors: string[];
  isKnownDevice: boolean;
  requiresVerification: boolean;
}

export class EnterpriseIPWhitelistManager {
  private static ipWhitelistCache: Map<string, IPWhitelistRule> = new Map();
  private static cacheExpiry: Map<string, number> = new Map();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if IP is allowed for organization
   */
  static async checkIPWhitelist(
    ipAddress: string,
    organizationId: string,
    userId?: string
  ): Promise<{ allowed: boolean; reason?: string; riskScore: number }> {
    try {
      // Get whitelist rules for organization
      const rules = await this.getIPWhitelistRules(organizationId);
      
      // If no rules configured, allow all IPs
      if (!rules) {
        return { allowed: true, riskScore: 0 };
      }

      // Check emergency bypass (for admin access)
      if (rules.emergencyBypass && userId) {
        const isEmergencyUser = await this.checkEmergencyUser(userId);
        if (isEmergencyUser) {
          await this.logSecurityEvent({
            organizationId,
            userId,
            eventType: 'admin_action_unusual',
            severity: 'medium',
            description: 'Emergency bypass used for IP whitelist',
            ipAddress,
            riskScore: 30,
            metadata: { reason: 'emergency_bypass' }
          });
          return { allowed: true, riskScore: 30 };
        }
      }

      // Check explicit IP whitelist
      if (rules.allowedIPs.includes(ipAddress)) {
        return { allowed: true, riskScore: 0 };
      }

      // Check CIDR ranges
      for (const cidr of rules.allowedCIDRs) {
        if (this.isIPInCIDR(ipAddress, cidr)) {
          return { allowed: true, riskScore: 0 };
        }
      }

      // Check geo restrictions
      const geoLocation = await this.getIPGeolocation(ipAddress);
      if (geoLocation) {
        const geoCheck = this.checkGeoRestrictions(geoLocation, rules.geoRestrictions);
        if (!geoCheck.allowed) {
          return {
            allowed: false,
            reason: geoCheck.reason,
            riskScore: 80
          };
        }
      }

      // If blockUnknownIPs is true, block this IP
      if (rules.blockUnknownIPs) {
        return {
          allowed: false,
          reason: 'IP not in whitelist',
          riskScore: 70
        };
      }

      // Default allow with moderate risk
      return { allowed: true, riskScore: 40 };

    } catch (error) {
      console.error('IP whitelist check error:', error);
      // Fail secure - deny unknown IPs on error
      return {
        allowed: false,
        reason: 'IP whitelist service unavailable',
        riskScore: 60
      };
    }
  }

  /**
   * Get IP whitelist rules for organization
   */
  private static async getIPWhitelistRules(organizationId: string): Promise<IPWhitelistRule | null> {
    // Check cache first
    const cacheKey = `ip-whitelist:${organizationId}`;
    const cached = this.ipWhitelistCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      const { data: org } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      if (!org?.security_settings?.ipWhitelisting?.enabled) {
        return null;
      }

      const rules: IPWhitelistRule = {
        organizationId,
        allowedIPs: org.security_settings.ipWhitelisting.allowedIPs || [],
        allowedCIDRs: org.security_settings.ipWhitelisting.allowedCIDRs || [],
        blockUnknownIPs: org.security_settings.ipWhitelisting.blockUnknownIPs || false,
        geoRestrictions: org.security_settings.ipWhitelisting.geoRestrictions || [],
        emergencyBypass: org.security_settings.ipWhitelisting.emergencyBypass || false
      };

      // Cache the rules
      this.ipWhitelistCache.set(cacheKey, rules);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);

      return rules;

    } catch (error) {
      console.error('Error fetching IP whitelist rules:', error);
      return null;
    }
  }

  /**
   * Check if user has emergency bypass privileges
   */
  private static async checkEmergencyUser(userId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      return user?.role === 'owner' || user?.role === 'admin';
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if IP is within CIDR range
   */
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    try {
      const [range, bits] = cidr.split('/');
      const mask = ~(2 ** (32 - parseInt(bits)) - 1);
      
      const ipInt = this.ipToInt(ip);
      const rangeInt = this.ipToInt(range);
      
      return (ipInt & mask) === (rangeInt & mask);
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert IP address to integer
   */
  private static ipToInt(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  }

  /**
   * Get IP geolocation information
   */
  private static async getIPGeolocation(ipAddress: string): Promise<GeoLocation | null> {
    try {
      // In production, use a real IP geolocation service
      // For now, return mock data for private IPs
      if (this.isPrivateIP(ipAddress)) {
        return {
          country: 'US',
          region: 'Private Network',
          city: 'Internal',
          latitude: 0,
          longitude: 0,
          timezone: 'UTC',
          isp: 'Private Network',
          organization: 'Internal'
        };
      }

      // Mock geolocation for demonstration
      return {
        country: 'US',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        isp: 'Mock ISP',
        organization: 'Mock Organization'
      };

    } catch (error) {
      console.error('Geolocation lookup error:', error);
      return null;
    }
  }

  /**
   * Check if IP is private/internal
   */
  private static isPrivateIP(ip: string): boolean {
    const octets = ip.split('.').map(Number);
    if (octets.length !== 4) return false;

    // 10.0.0.0/8
    if (octets[0] === 10) return true;
    
    // 172.16.0.0/12
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    
    // 192.168.0.0/16
    if (octets[0] === 192 && octets[1] === 168) return true;
    
    // 127.0.0.0/8 (localhost)
    if (octets[0] === 127) return true;

    return false;
  }

  /**
   * Check geo restrictions
   */
  private static checkGeoRestrictions(
    location: GeoLocation,
    restrictions: GeoRestriction[]
  ): { allowed: boolean; reason?: string } {
    if (restrictions.length === 0) {
      return { allowed: true };
    }

    for (const restriction of restrictions) {
      if (location.country === restriction.countryCode) {
        return {
          allowed: restriction.allowed,
          reason: restriction.allowed ? undefined : restriction.reason
        };
      }
    }

    // Default behavior when country not in restrictions
    return { allowed: true };
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    try {
      await supabaseAdmin
        .from('security_events')
        .insert([{
          ...event,
          detectedAt: new Date(),
          status: 'open'
        }]);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export class EnterpriseDeviceFingerprintManager {
  /**
   * Generate device fingerprint from request
   */
  static generateFingerprint(request: NextRequest): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const connection = request.headers.get('connection') || '';
    
    // Create fingerprint components
    const components = [
      userAgent,
      acceptLanguage,
      acceptEncoding,
      connection,
      // Add more headers as needed for uniqueness
    ].filter(Boolean);

    // Generate hash
    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex')
      .substring(0, 32); // Truncate for storage efficiency
  }

  /**
   * Analyze device and determine trust level
   */
  static async analyzeDevice(
    request: NextRequest,
    userId?: string,
    organizationId?: string
  ): Promise<DeviceAnalysis> {
    const fingerprint = this.generateFingerprint(request);
    const userAgent = request.headers.get('user-agent') || '';

    // Parse user agent for device info
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    // Check if this is a known device
    const knownDevice = userId ? await this.getKnownDevice(fingerprint, userId) : null;

    const analysis: DeviceAnalysis = {
      fingerprint,
      trustScore: 50, // Base score
      riskFactors: [],
      isKnownDevice: !!knownDevice,
      requiresVerification: false
    };

    // Analyze browser and OS
    this.analyzeBrowserAndOS(result, analysis);

    // Analyze device characteristics
    this.analyzeDeviceCharacteristics(request, analysis);

    // Check against threat intelligence
    await this.checkThreatIntelligence(fingerprint, userAgent, analysis);

    // Adjust trust score based on known device
    if (knownDevice) {
      analysis.trustScore += 30;
      // Update last seen
      await this.updateDeviceLastSeen(knownDevice.id);
    } else if (userId) {
      // New device for existing user
      analysis.trustScore -= 20;
      analysis.requiresVerification = true;
      analysis.riskFactors.push('new_device');
    }

    // Determine final trust level and verification requirements
    if (analysis.trustScore < 40) {
      analysis.requiresVerification = true;
    }

    return analysis;
  }

  /**
   * Analyze browser and OS characteristics
   */
  private static analyzeBrowserAndOS(result: any, analysis: DeviceAnalysis): void {
    const browser = result.browser;
    const os = result.os;

    // Check for unusual browsers or automated tools
    const suspiciousBrowsers = ['phantomjs', 'selenium', 'headless', 'bot', 'crawler'];
    if (suspiciousBrowsers.some(term => 
      browser.name?.toLowerCase().includes(term) ||
      result.ua?.toLowerCase().includes(term)
    )) {
      analysis.trustScore -= 30;
      analysis.riskFactors.push('suspicious_browser');
    }

    // Check for outdated browsers (security risk)
    if (browser.version) {
      const version = parseFloat(browser.version);
      const browserRules = {
        'chrome': 90, // Minimum Chrome version
        'firefox': 85,
        'safari': 14,
        'edge': 90
      };

      const minVersion = browserRules[browser.name?.toLowerCase() as keyof typeof browserRules];
      if (minVersion && version < minVersion) {
        analysis.trustScore -= 15;
        analysis.riskFactors.push('outdated_browser');
      }
    }

    // Check OS
    if (os.name) {
      // Penalize unknown or unusual operating systems
      const commonOSes = ['windows', 'macos', 'linux', 'ios', 'android'];
      if (!commonOSes.some(osName => os.name?.toLowerCase().includes(osName))) {
        analysis.trustScore -= 10;
        analysis.riskFactors.push('unusual_os');
      }
    }
  }

  /**
   * Analyze device characteristics from headers
   */
  private static analyzeDeviceCharacteristics(request: NextRequest, analysis: DeviceAnalysis): void {
    // Check for missing common headers
    const expectedHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = expectedHeaders.filter(header => !request.headers.get(header));
    
    if (missingHeaders.length > 0) {
      analysis.trustScore -= missingHeaders.length * 5;
      analysis.riskFactors.push('missing_headers');
    }

    // Check for suspicious header patterns
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.length < 20 || userAgent.length > 1000) {
      analysis.trustScore -= 10;
      analysis.riskFactors.push('unusual_user_agent');
    }

    // Check for proxy indicators
    const proxyHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-proxy-id',
      'via'
    ];

    const proxyIndicators = proxyHeaders.filter(header => request.headers.get(header));
    if (proxyIndicators.length > 2) {
      analysis.trustScore -= 15;
      analysis.riskFactors.push('multiple_proxies');
    }
  }

  /**
   * Check against threat intelligence
   */
  private static async checkThreatIntelligence(
    fingerprint: string,
    userAgent: string,
    analysis: DeviceAnalysis
  ): Promise<void> {
    try {
      // Check against known malicious fingerprints
      const { data: threats } = await supabase
        .from('threat_intelligence')
        .select('*')
        .eq('type', 'device_fingerprint')
        .eq('value', fingerprint)
        .eq('status', 'active');

      if (threats && threats.length > 0) {
        analysis.trustScore = Math.min(analysis.trustScore, 10);
        analysis.riskFactors.push('known_threat');
        analysis.requiresVerification = true;
      }

      // Check user agent against threat patterns
      const suspiciousPatterns = [
        /bot|crawler|spider/i,
        /automated|script|tool/i,
        /test|debug|dev/i
      ];

      if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        analysis.trustScore -= 20;
        analysis.riskFactors.push('suspicious_user_agent');
      }

    } catch (error) {
      console.error('Threat intelligence check error:', error);
      // On error, apply moderate penalty
      analysis.trustScore -= 5;
    }
  }

  /**
   * Get known device for user
   */
  private static async getKnownDevice(fingerprint: string, userId: string): Promise<DeviceFingerprint | null> {
    try {
      const { data: device } = await supabase
        .from('device_fingerprints')
        .select('*')
        .eq('fingerprint', fingerprint)
        .eq('user_id', userId)
        .eq('trust_level', 'trusted')
        .single();

      return device ? {
        id: device.id,
        userId: device.user_id,
        organizationId: device.organization_id,
        fingerprint: device.fingerprint,
        deviceInfo: device.device_info,
        trustLevel: device.trust_level,
        firstSeen: new Date(device.first_seen),
        lastSeen: new Date(device.last_seen),
        verificationStatus: device.verification_status,
        riskScore: device.risk_score,
        metadata: device.metadata
      } : null;

    } catch (error) {
      console.error('Error fetching known device:', error);
      return null;
    }
  }

  /**
   * Register new device for user
   */
  static async registerDevice(
    request: NextRequest,
    userId: string,
    organizationId: string,
    analysis: DeviceAnalysis
  ): Promise<DeviceFingerprint> {
    const userAgent = request.headers.get('user-agent') || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const deviceInfo = {
      userAgent,
      platform: result.os.name || 'unknown',
      browser: result.browser.name || 'unknown',
      version: result.browser.version || 'unknown',
      screenResolution: 'unknown',
      timezone: 'unknown',
      language: request.headers.get('accept-language') || 'unknown',
      hardwareInfo: {}
    };

    const device = {
      id: crypto.randomUUID(),
      userId,
      organizationId,
      fingerprint: analysis.fingerprint,
      deviceInfo,
      trustLevel: analysis.trustScore >= 70 ? 'trusted' : 
                  analysis.trustScore >= 40 ? 'unknown' : 'suspicious',
      firstSeen: new Date(),
      lastSeen: new Date(),
      verificationStatus: analysis.requiresVerification ? 'pending' : 'verified',
      riskScore: Math.max(0, 100 - analysis.trustScore),
      metadata: {
        riskFactors: analysis.riskFactors,
        initialTrustScore: analysis.trustScore
      }
    };

    await supabaseAdmin
      .from('device_fingerprints')
      .insert([{
        id: device.id,
        user_id: device.userId,
        organization_id: device.organizationId,
        fingerprint: device.fingerprint,
        device_info: device.deviceInfo,
        trust_level: device.trustLevel,
        first_seen: device.firstSeen.toISOString(),
        last_seen: device.lastSeen.toISOString(),
        verification_status: device.verificationStatus,
        risk_score: device.riskScore,
        metadata: device.metadata
      }]);

    return device as DeviceFingerprint;
  }

  /**
   * Update device last seen timestamp
   */
  private static async updateDeviceLastSeen(deviceId: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('device_fingerprints')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', deviceId);
    } catch (error) {
      console.error('Error updating device last seen:', error);
    }
  }
}

/**
 * Combined IP Whitelist and Device Fingerprinting Middleware
 */
export function withIPWhitelistAndDeviceFingerprint(handler: Function) {
  return async (request: NextRequest) => {
    try {
      const ipAddress = request.ip || request.headers.get('x-forwarded-for') || '0.0.0.0';
      let userId: string | undefined;
      let organizationId: string | undefined;

      // Extract user context if authenticated
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        try {
          // This would integrate with your existing auth system
          // For now, assume we can extract user info from token
          // const userInfo = await extractUserFromToken(authHeader);
          // userId = userInfo.userId;
          // organizationId = userInfo.organizationId;
        } catch (error) {
          // Continue without user context
        }
      }

      // Check IP whitelist if user is authenticated
      if (userId && organizationId) {
        const ipCheck = await EnterpriseIPWhitelistManager.checkIPWhitelist(
          ipAddress,
          organizationId,
          userId
        );

        if (!ipCheck.allowed) {
          // Log security event
          await EnterpriseIPWhitelistManager.logSecurityEvent({
            organizationId,
            userId,
            eventType: 'unauthorized_access_attempt',
            severity: 'high',
            source: 'ip_whitelist_middleware',
            description: `Access denied from non-whitelisted IP: ${ipAddress}`,
            ipAddress,
            riskScore: ipCheck.riskScore,
            mitigationActions: ['ip_block'],
            metadata: { reason: ipCheck.reason }
          });

          return NextResponse.json({
            error: 'Access denied',
            message: ipCheck.reason || 'IP address not authorized'
          }, { status: 403 });
        }
      }

      // Analyze device fingerprint
      const deviceAnalysis = await EnterpriseDeviceFingerprintManager.analyzeDevice(
        request,
        userId,
        organizationId
      );

      // If new device requires verification for authenticated users
      if (userId && organizationId && !deviceAnalysis.isKnownDevice) {
        await EnterpriseDeviceFingerprintManager.registerDevice(
          request,
          userId,
          organizationId,
          deviceAnalysis
        );

        // Log new device detection
        await EnterpriseIPWhitelistManager.logSecurityEvent({
          organizationId,
          userId,
          eventType: 'suspicious_device',
          severity: deviceAnalysis.trustScore < 40 ? 'high' : 'medium',
          source: 'device_fingerprint_middleware',
          description: `New device detected: ${deviceAnalysis.fingerprint.substring(0, 8)}...`,
          ipAddress,
          deviceFingerprint: deviceAnalysis.fingerprint,
          riskScore: Math.max(0, 100 - deviceAnalysis.trustScore),
          metadata: {
            deviceAnalysis,
            requiresVerification: deviceAnalysis.requiresVerification
          }
        });
      }

      // Add security context to request
      (request as any).securityContext = {
        ipAddress,
        deviceFingerprint: deviceAnalysis.fingerprint,
        deviceTrustScore: deviceAnalysis.trustScore,
        requiresDeviceVerification: deviceAnalysis.requiresVerification,
        riskFactors: deviceAnalysis.riskFactors
      };

      // Call the handler
      return await handler(request);

    } catch (error) {
      console.error('IP/Device middleware error:', error);
      return NextResponse.json({
        error: 'Security validation failed'
      }, { status: 500 });
    }
  };
}

export default withIPWhitelistAndDeviceFingerprint;