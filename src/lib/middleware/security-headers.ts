// Enterprise Security Headers Middleware
// PrismForge AI - Comprehensive Web Application Security Headers

import { NextRequest, NextResponse } from 'next/server';
import { SecurityHeaders } from '@/types/security.types';
import { supabase } from '@/lib/supabase';

interface SecurityHeadersConfig {
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly: boolean;
    reportUri?: string;
  };
  xss: {
    enabled: boolean;
    mode: 'block' | 'sanitize';
  };
  frameOptions: {
    enabled: boolean;
    policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    allowFrom?: string;
  };
  contentTypeOptions: {
    enabled: boolean;
    nosniff: boolean;
  };
  referrerPolicy: {
    enabled: boolean;
    policy: string;
  };
  permissionsPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
  cors: {
    enabled: boolean;
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    allowCredentials: boolean;
    maxAge: number;
  };
}

export class EnterpriseSecurityHeadersManager {
  static defaultConfig: SecurityHeadersConfig = {
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    contentSecurityPolicy: {
      enabled: true,
      reportOnly: false,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'", // Required for Next.js development
          "'unsafe-eval'", // Required for Next.js development
          'https://vercel.live',
          'https://claude.ai'
        ],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com'
        ],
        'font-src': [
          "'self'",
          'https://fonts.gstatic.com'
        ],
        'img-src': [
          "'self'",
          'data:',
          'blob:',
          'https://*.supabase.co',
          'https://vercel.com'
        ],
        'connect-src': [
          "'self'",
          'https://*.supabase.co',
          'https://api.anthropic.com',
          'wss://*.supabase.co'
        ],
        'media-src': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'upgrade-insecure-requests': []
      }
    },
    xss: {
      enabled: true,
      mode: 'block'
    },
    frameOptions: {
      enabled: true,
      policy: 'DENY'
    },
    contentTypeOptions: {
      enabled: true,
      nosniff: true
    },
    referrerPolicy: {
      enabled: true,
      policy: 'strict-origin-when-cross-origin'
    },
    permissionsPolicy: {
      enabled: true,
      directives: {
        'accelerometer': [],
        'ambient-light-sensor': [],
        'autoplay': [],
        'battery': [],
        'camera': [],
        'cross-origin-isolated': [],
        'display-capture': [],
        'document-domain': [],
        'encrypted-media': [],
        'execution-while-not-rendered': [],
        'execution-while-out-of-viewport': [],
        'fullscreen': ['self'],
        'geolocation': [],
        'gyroscope': [],
        'keyboard-map': [],
        'magnetometer': [],
        'microphone': [],
        'midi': [],
        'navigation-override': [],
        'payment': [],
        'picture-in-picture': [],
        'publickey-credentials-get': [],
        'screen-wake-lock': [],
        'sync-xhr': [],
        'usb': [],
        'web-share': [],
        'xr-spatial-tracking': []
      }
    },
    cors: {
      enabled: true,
      allowedOrigins: ['https://app.prismforge.ai', 'https://*.prismforge.ai'],
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
      allowCredentials: true,
      maxAge: 86400 // 24 hours
    }
  };

  /**
   * Get security headers configuration for organization
   */
  static async getSecurityConfig(organizationId?: string): Promise<SecurityHeadersConfig> {
    try {
      if (!organizationId) {
        return this.defaultConfig;
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('security_settings')
        .eq('id', organizationId)
        .single();

      const customConfig = org?.security_settings?.headers;
      if (!customConfig) {
        return this.defaultConfig;
      }

      // Merge custom configuration with defaults
      return this.mergeConfigs(this.defaultConfig, customConfig);

    } catch (error) {
      console.error('Error fetching security config:', error);
      return this.defaultConfig;
    }
  }

  /**
   * Generate security headers based on configuration
   */
  static generateSecurityHeaders(
    config: SecurityHeadersConfig,
    request: NextRequest
  ): Record<string, string> {
    const headers: Record<string, string> = {};

    // Strict Transport Security (HSTS)
    if (config.hsts.enabled) {
      let hstsValue = `max-age=${config.hsts.maxAge}`;
      if (config.hsts.includeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      if (config.hsts.preload) {
        hstsValue += '; preload';
      }
      headers['Strict-Transport-Security'] = hstsValue;
    }

    // Content Security Policy
    if (config.contentSecurityPolicy.enabled) {
      const cspDirectives = Object.entries(config.contentSecurityPolicy.directives)
        .map(([directive, values]) => {
          if (values.length === 0) {
            return directive;
          }
          return `${directive} ${values.join(' ')}`;
        })
        .join('; ');

      const cspHeader = config.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

      headers[cspHeader] = cspDirectives;

      // Add report URI if configured
      if (config.contentSecurityPolicy.reportUri) {
        headers[cspHeader] += `; report-uri ${config.contentSecurityPolicy.reportUri}`;
      }
    }

    // X-XSS-Protection
    if (config.xss.enabled) {
      headers['X-XSS-Protection'] = config.xss.mode === 'block' ? '1; mode=block' : '1';
    }

    // X-Frame-Options
    if (config.frameOptions.enabled) {
      let frameOptionsValue = config.frameOptions.policy;
      if (config.frameOptions.policy === 'ALLOW-FROM' && config.frameOptions.allowFrom) {
        frameOptionsValue += ` ${config.frameOptions.allowFrom}`;
      }
      headers['X-Frame-Options'] = frameOptionsValue;
    }

    // X-Content-Type-Options
    if (config.contentTypeOptions.enabled && config.contentTypeOptions.nosniff) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // Referrer-Policy
    if (config.referrerPolicy.enabled) {
      headers['Referrer-Policy'] = config.referrerPolicy.policy;
    }

    // Permissions-Policy (formerly Feature-Policy)
    if (config.permissionsPolicy.enabled) {
      const permissionsDirectives = Object.entries(config.permissionsPolicy.directives)
        .map(([directive, allowList]) => {
          if (allowList.length === 0) {
            return `${directive}=()`;
          }
          const origins = allowList.map(origin => 
            origin === 'self' ? 'self' : `"${origin}"`
          ).join(' ');
          return `${directive}=(${origins})`;
        })
        .join(', ');

      headers['Permissions-Policy'] = permissionsDirectives;
    }

    // Cross-Origin Headers for additional security
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';

    // Additional security headers
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';
    headers['X-Download-Options'] = 'noopen';

    // Remove server identification
    headers['Server'] = 'PrismForge';

    return headers;
  }

  /**
   * Handle CORS preflight requests
   */
  static handleCORSPreflight(
    config: SecurityHeadersConfig,
    request: NextRequest
  ): NextResponse | null {
    if (request.method !== 'OPTIONS' || !config.cors.enabled) {
      return null;
    }

    const origin = request.headers.get('origin');
    const requestedMethod = request.headers.get('access-control-request-method');
    const requestedHeaders = request.headers.get('access-control-request-headers');

    // Check if origin is allowed
    const isOriginAllowed = this.isOriginAllowed(origin, config.cors.allowedOrigins);
    if (!isOriginAllowed) {
      return new NextResponse(null, { status: 403 });
    }

    // Check if method is allowed
    if (requestedMethod && !config.cors.allowedMethods.includes(requestedMethod)) {
      return new NextResponse(null, { status: 405 });
    }

    // Prepare CORS headers
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Methods': config.cors.allowedMethods.join(', '),
      'Access-Control-Allow-Headers': config.cors.allowedHeaders.join(', '),
      'Access-Control-Max-Age': config.cors.maxAge.toString()
    };

    if (config.cors.allowCredentials) {
      corsHeaders['Access-Control-Allow-Credentials'] = 'true';
    }

    if (config.cors.exposedHeaders.length > 0) {
      corsHeaders['Access-Control-Expose-Headers'] = config.cors.exposedHeaders.join(', ');
    }

    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  /**
   * Apply CORS headers to response
   */
  static applyCORSHeaders(
    response: NextResponse,
    config: SecurityHeadersConfig,
    request: NextRequest
  ): void {
    if (!config.cors.enabled) return;

    const origin = request.headers.get('origin');
    const isOriginAllowed = this.isOriginAllowed(origin, config.cors.allowedOrigins);

    if (isOriginAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      
      if (config.cors.allowCredentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (config.cors.exposedHeaders.length > 0) {
        response.headers.set(
          'Access-Control-Expose-Headers', 
          config.cors.exposedHeaders.join(', ')
        );
      }
    }
  }

  /**
   * Validate request against security policies
   */
  static validateSecurityPolicies(
    request: NextRequest,
    config: SecurityHeadersConfig
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check if HTTPS is enforced
    if (config.hsts.enabled && request.url.startsWith('http:')) {
      violations.push('Request must use HTTPS');
    }

    // Check Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type');
      if (!contentType) {
        violations.push('Missing Content-Type header');
      } else if (contentType.includes('text/html')) {
        violations.push('HTML content not allowed in request body');
      }
    }

    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-original-url',
      'x-rewrite-url'
    ];

    suspiciousHeaders.forEach(header => {
      if (request.headers.get(header)) {
        violations.push(`Suspicious header detected: ${header}`);
      }
    });

    // Check User-Agent
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      violations.push('Missing or suspicious User-Agent header');
    }

    // Check for potential CSRF attacks
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const referer = request.headers.get('referer');
      const origin = request.headers.get('origin');
      
      if (!referer && !origin) {
        violations.push('Missing origin/referer header for state-changing request');
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Generate Content Security Policy nonce
   */
  static generateCSPNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  /**
   * Create CSP violation report endpoint response
   */
  static handleCSPViolationReport(request: NextRequest): NextResponse {
    // Log CSP violation for security monitoring
    console.warn('CSP Violation Report:', {
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      timestamp: new Date().toISOString()
    });

    // In production, this would be logged to security monitoring system
    return new NextResponse(null, { status: 204 });
  }

  /**
   * Private helper methods
   */
  private static mergeConfigs(
    defaultConfig: SecurityHeadersConfig,
    customConfig: Partial<SecurityHeadersConfig>
  ): SecurityHeadersConfig {
    return {
      ...defaultConfig,
      ...customConfig,
      contentSecurityPolicy: {
        ...defaultConfig.contentSecurityPolicy,
        ...customConfig.contentSecurityPolicy,
        directives: {
          ...defaultConfig.contentSecurityPolicy.directives,
          ...customConfig.contentSecurityPolicy?.directives
        }
      },
      permissionsPolicy: {
        ...defaultConfig.permissionsPolicy,
        ...customConfig.permissionsPolicy,
        directives: {
          ...defaultConfig.permissionsPolicy.directives,
          ...customConfig.permissionsPolicy?.directives
        }
      }
    };
  }

  private static isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
    if (!origin) return false;

    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed === origin) return true;
      
      // Handle wildcard subdomains
      if (allowed.startsWith('*.')) {
        const domain = allowed.substring(2);
        return origin.endsWith('.' + domain) || origin === domain;
      }
      
      return false;
    });
  }
}

/**
 * Security Headers Middleware
 */
export function withSecurityHeaders(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Extract organization ID from request if available
      let organizationId: string | undefined;
      const authHeader = request.headers.get('authorization');
      
      if (authHeader) {
        try {
          // Extract organization from JWT token
          // This would integrate with your auth system
          // organizationId = extractOrgFromToken(authHeader);
        } catch (error) {
          // Continue without organization context
        }
      }

      // Get security configuration
      const config = await EnterpriseSecurityHeadersManager.getSecurityConfig(organizationId);

      // Handle CORS preflight
      const corsPreflight = EnterpriseSecurityHeadersManager.handleCORSPreflight(config, request);
      if (corsPreflight) {
        return corsPreflight;
      }

      // Validate security policies
      const validation = EnterpriseSecurityHeadersManager.validateSecurityPolicies(request, config);
      if (!validation.valid) {
        console.warn('Security policy violations:', validation.violations);
        
        // For high-security environments, you might want to block these requests
        // return NextResponse.json({
        //   error: 'Security policy violation',
        //   violations: validation.violations
        // }, { status: 400 });
      }

      // Call the handler
      const response = await handler(request);

      // Ensure response is a NextResponse
      let nextResponse: NextResponse;
      if (response instanceof NextResponse) {
        nextResponse = response;
      } else {
        nextResponse = NextResponse.json(response);
      }

      // Apply security headers
      const securityHeaders = EnterpriseSecurityHeadersManager.generateSecurityHeaders(config, request);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        nextResponse.headers.set(key, value);
      });

      // Apply CORS headers
      EnterpriseSecurityHeadersManager.applyCORSHeaders(nextResponse, config, request);

      return nextResponse;

    } catch (error) {
      console.error('Security headers middleware error:', error);
      
      // Return response with basic security headers on error
      const response = await handler(request);
      const nextResponse = response instanceof NextResponse 
        ? response 
        : NextResponse.json(response);

      // Apply minimal security headers
      const basicHeaders = EnterpriseSecurityHeadersManager.generateSecurityHeaders(
        EnterpriseSecurityHeadersManager.defaultConfig,
        request
      );
      
      Object.entries(basicHeaders).forEach(([key, value]) => {
        nextResponse.headers.set(key, value);
      });

      return nextResponse;
    }
  };
}

/**
 * CSP Report Handler
 */
export function handleCSPReport(handler: Function) {
  return async (request: NextRequest) => {
    if (request.method === 'POST' && request.url.includes('/csp-report')) {
      return EnterpriseSecurityHeadersManager.handleCSPViolationReport(request);
    }
    
    return handler(request);
  };
}

export default withSecurityHeaders;