// Enterprise API Rate Limiting and Request Validation Middleware
// PrismForge AI - Advanced Security Controls for API Protection

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { RateLimitRule, APIRequestValidation, SecurityEvent } from '@/types/security.types';
import { permissionManager } from '@/lib/enterprise/permission-manager';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RequestContext {
  userId?: string;
  organizationId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  method: string;
  sessionId?: string;
}

export class EnterpriseRateLimitManager {
  private static instance: EnterpriseRateLimitManager;
  private rateLimitStore: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  static getInstance(): EnterpriseRateLimitManager {
    if (!this.instance) {
      this.instance = new EnterpriseRateLimitManager();
    }
    return this.instance;
  }

  /**
   * Apply rate limiting with enterprise-specific rules
   */
  async applyRateLimit(
    request: NextRequest,
    rule: RateLimitRule,
    context: RequestContext
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; reason?: string }> {
    const key = await this.generateRateLimitKey(rule, context, request);
    const now = Date.now();

    // Get or create rate limit entry
    if (!this.rateLimitStore[key]) {
      this.rateLimitStore[key] = {
        count: 0,
        resetTime: now + rule.windowMs
      };
    }

    const entry = this.rateLimitStore[key];

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + rule.windowMs;
    }

    // Check if limit exceeded
    if (entry.count >= rule.maxRequests) {
      // Log security event for rate limit violation
      await this.logRateLimitViolation(context, rule, entry.count);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        reason: rule.message || 'Rate limit exceeded'
      };
    }

    // Increment counter
    entry.count++;

    return {
      allowed: true,
      remaining: rule.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Generate rate limit key based on rule configuration
   */
  private async generateRateLimitKey(
    rule: RateLimitRule,
    context: RequestContext,
    request: NextRequest
  ): Promise<string> {
    const keyParts = [context.endpoint, context.method];

    // Default key generation based on IP + User
    if (!rule.keyGenerator || rule.keyGenerator === 'ip_user') {
      if (context.userId) {
        keyParts.push(`user:${context.userId}`);
      } else {
        keyParts.push(`ip:${context.ipAddress}`);
      }
    }
    // Organization-based rate limiting for enterprise features
    else if (rule.keyGenerator === 'organization') {
      keyParts.push(`org:${context.organizationId || 'anonymous'}`);
    }
    // IP-only rate limiting for anonymous requests
    else if (rule.keyGenerator === 'ip') {
      keyParts.push(`ip:${context.ipAddress}`);
    }
    // User-only rate limiting for authenticated requests
    else if (rule.keyGenerator === 'user') {
      keyParts.push(`user:${context.userId || 'anonymous'}`);
    }
    // Custom key generation
    else if (rule.keyGenerator.startsWith('custom:')) {
      const customKey = await this.generateCustomKey(rule.keyGenerator, context, request);
      keyParts.push(customKey);
    }

    return keyParts.join(':');
  }

  /**
   * Generate custom rate limit key
   */
  private async generateCustomKey(
    keyGenerator: string,
    context: RequestContext,
    request: NextRequest
  ): Promise<string> {
    const keyType = keyGenerator.replace('custom:', '');
    
    switch (keyType) {
      case 'session':
        return `session:${context.sessionId || 'anonymous'}`;
      case 'user_role':
        if (context.userId) {
          const user = await this.getUserRole(context.userId);
          return `role:${user?.role || 'anonymous'}`;
        }
        return 'role:anonymous';
      case 'endpoint_user':
        return `${context.endpoint}:user:${context.userId || context.ipAddress}`;
      default:
        return 'custom:unknown';
    }
  }

  /**
   * Get user role for rate limiting
   */
  private async getUserRole(userId: string): Promise<{ role: string } | null> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Log rate limit violation as security event
   */
  private async logRateLimitViolation(
    context: RequestContext,
    rule: RateLimitRule,
    attemptCount: number
  ): Promise<void> {
    try {
      const securityEvent: Partial<SecurityEvent> = {
        organizationId: context.organizationId || 'unknown',
        userId: context.userId,
        eventType: 'rate_limit_exceeded',
        severity: attemptCount > rule.maxRequests * 2 ? 'high' : 'medium',
        source: 'rate_limit_middleware',
        description: `Rate limit exceeded for ${context.endpoint} (${attemptCount}/${rule.maxRequests})`,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        riskScore: Math.min(100, (attemptCount / rule.maxRequests) * 50),
        mitigationActions: ['temporary_block', 'increased_monitoring'],
        status: 'open',
        metadata: {
          endpoint: context.endpoint,
          method: context.method,
          rule,
          attemptCount,
          windowMs: rule.windowMs
        },
        detectedAt: new Date()
      };

      await this.createSecurityEvent(securityEvent);
    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }

  /**
   * Create security event in database
   */
  private async createSecurityEvent(event: Partial<SecurityEvent>): Promise<void> {
    await supabaseAdmin
      .from('security_events')
      .insert([event]);
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keys = Object.keys(this.rateLimitStore);
    
    for (const key of keys) {
      if (now >= this.rateLimitStore[key].resetTime) {
        delete this.rateLimitStore[key];
      }
    }
  }

  /**
   * Get rate limit status for a key
   */
  async getRateLimitStatus(
    request: NextRequest,
    rule: RateLimitRule,
    context: RequestContext
  ): Promise<{ current: number; limit: number; remaining: number; resetTime: number }> {
    const key = await this.generateRateLimitKey(rule, context, request);
    const entry = this.rateLimitStore[key];
    
    if (!entry) {
      return {
        current: 0,
        limit: rule.maxRequests,
        remaining: rule.maxRequests,
        resetTime: Date.now() + rule.windowMs
      };
    }

    return {
      current: entry.count,
      limit: rule.maxRequests,
      remaining: Math.max(0, rule.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for a specific key (admin function)
   */
  async resetRateLimit(
    request: NextRequest,
    rule: RateLimitRule,
    context: RequestContext
  ): Promise<void> {
    const key = await this.generateRateLimitKey(rule, context, request);
    delete this.rateLimitStore[key];
  }
}

/**
 * Enterprise Request Validation Middleware
 */
export class RequestValidator {
  private static validationRules: Map<string, APIRequestValidation> = new Map();

  /**
   * Register validation rule for an endpoint
   */
  static registerRule(pattern: string, rule: APIRequestValidation): void {
    this.validationRules.set(pattern, rule);
  }

  /**
   * Initialize default validation rules
   */
  static initializeDefaultRules(): void {
    // Analysis endpoints - high-value operations
    this.registerRule('/api/analysis/*', {
      endpoint: '/api/analysis/*',
      method: 'POST',
      requiredHeaders: ['authorization', 'content-type'],
      allowedContentTypes: ['application/json'],
      maxBodySize: 10 * 1024 * 1024, // 10MB
      requireAuthentication: true,
      requiredPermissions: ['analyses.create'],
      rateLimitRule: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5, // 5 analysis requests per minute
        message: 'Analysis rate limit exceeded. Please wait before creating another analysis.'
      }
    });

    // User management endpoints
    this.registerRule('/api/users/*', {
      endpoint: '/api/users/*',
      method: 'POST|PUT|DELETE',
      requiredHeaders: ['authorization'],
      allowedContentTypes: ['application/json'],
      maxBodySize: 1024 * 1024, // 1MB
      requireAuthentication: true,
      requiredPermissions: ['users.manage'],
      rateLimitRule: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 20,
        keyGenerator: 'user'
      }
    });

    // Auth endpoints
    this.registerRule('/api/auth/*', {
      endpoint: '/api/auth/*',
      method: 'POST',
      requiredHeaders: ['content-type'],
      allowedContentTypes: ['application/json'],
      maxBodySize: 10 * 1024, // 10KB
      requireAuthentication: false,
      requiredPermissions: [],
      rateLimitRule: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 auth attempts per 15 minutes
        keyGenerator: 'ip'
      }
    });

    // Enterprise reports
    this.registerRule('/api/reports/*', {
      endpoint: '/api/reports/*',
      method: 'POST',
      requiredHeaders: ['authorization'],
      allowedContentTypes: ['application/json'],
      maxBodySize: 5 * 1024 * 1024, // 5MB
      requireAuthentication: true,
      requiredPermissions: ['reports.generate'],
      rateLimitRule: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // 10 reports per hour
        keyGenerator: 'organization'
      }
    });
  }

  /**
   * Validate request against registered rules
   */
  static async validateRequest(request: NextRequest, context: RequestContext): Promise<{
    valid: boolean;
    errors: string[];
    rateLimitResult?: any;
  }> {
    const errors: string[] = [];
    const pathname = new URL(request.url).pathname;
    
    // Find matching validation rule
    const rule = this.findMatchingRule(pathname, request.method);
    if (!rule) {
      return { valid: true, errors: [] }; // No validation rule found, allow request
    }

    // Validate headers
    if (rule.requiredHeaders.length > 0) {
      for (const header of rule.requiredHeaders) {
        if (!request.headers.get(header)) {
          errors.push(`Missing required header: ${header}`);
        }
      }
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (rule.allowedContentTypes.length > 0 && contentType) {
      const isAllowed = rule.allowedContentTypes.some(allowed => 
        contentType.includes(allowed)
      );
      if (!isAllowed) {
        errors.push(`Invalid content type: ${contentType}`);
      }
    }

    // Validate body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > rule.maxBodySize) {
      errors.push(`Request body too large: ${contentLength} bytes (max: ${rule.maxBodySize})`);
    }

    // Validate authentication
    if (rule.requireAuthentication) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader && !context.userId) {
        errors.push('Authentication required');
      }
    }

    // Validate permissions
    if (rule.requiredPermissions.length > 0 && context.userId) {
      for (const permission of rule.requiredPermissions) {
        const hasPermission = await permissionManager.checkPermission(
          context.userId,
          permission
        );
        if (!hasPermission) {
          errors.push(`Insufficient permissions: ${permission}`);
        }
      }
    }

    // Apply rate limiting
    let rateLimitResult;
    if (rule.rateLimitRule) {
      const rateLimitManager = EnterpriseRateLimitManager.getInstance();
      rateLimitResult = await rateLimitManager.applyRateLimit(
        request,
        rule.rateLimitRule,
        context
      );
      
      if (!rateLimitResult.allowed) {
        errors.push(rateLimitResult.reason || 'Rate limit exceeded');
      }
    }

    // Custom validation
    if (rule.customValidation) {
      try {
        const isValid = await rule.customValidation(request);
        if (!isValid) {
          errors.push('Custom validation failed');
        }
      } catch (error) {
        errors.push('Custom validation error');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      rateLimitResult
    };
  }

  /**
   * Find matching validation rule for endpoint
   */
  private static findMatchingRule(pathname: string, method: string): APIRequestValidation | null {
    for (const [pattern, rule] of Array.from(this.validationRules.entries())) {
      if (this.matchesPattern(pathname, pattern) && this.matchesMethod(method, rule.method)) {
        return rule;
      }
    }
    return null;
  }

  /**
   * Check if pathname matches pattern
   */
  private static matchesPattern(pathname: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\//g, '\\/') + '$'
    );
    return regex.test(pathname);
  }

  /**
   * Check if method matches rule
   */
  private static matchesMethod(method: string, ruleMethod: string): boolean {
    if (ruleMethod.includes('|')) {
      return ruleMethod.split('|').includes(method);
    }
    return method === ruleMethod;
  }
}

/**
 * Enterprise Rate Limit and Validation Middleware
 */
export function withEnterpriseRateLimit(handler: Function) {
  return async (request: NextRequest) => {
    try {
      // Initialize validation rules
      RequestValidator.initializeDefaultRules();

      // Extract request context
      const context: RequestContext = {
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: request.headers.get('user-agent') || '',
        endpoint: new URL(request.url).pathname,
        method: request.method
      };

      // Extract user context from authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const validation = await permissionManager.validateSessionToken(token);
          if (validation.valid && validation.userId) {
            context.userId = validation.userId;
            // Get organization from user
            const { data: user } = await supabase
              .from('users')
              .select('organization_id')
              .eq('id', validation.userId)
              .single();
            context.organizationId = user?.organization_id;
          }
        } catch (error) {
          // Invalid token, continue with anonymous context
        }
      }

      // Validate request
      const validationResult = await RequestValidator.validateRequest(request, context);
      
      if (!validationResult.valid) {
        const response = NextResponse.json({
          error: 'Request validation failed',
          details: validationResult.errors
        }, { status: 400 });

        // Add rate limit headers if applicable
        if (validationResult.rateLimitResult) {
          const { remaining, resetTime } = validationResult.rateLimitResult;
          response.headers.set('X-RateLimit-Remaining', remaining.toString());
          response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        }

        return response;
      }

      // Add request context to request object
      (request as any).context = context;
      (request as any).rateLimitResult = validationResult.rateLimitResult;

      // Call handler
      const response = await handler(request);

      // Add rate limit headers to successful responses
      if (validationResult.rateLimitResult && response instanceof NextResponse) {
        const { remaining, resetTime } = validationResult.rateLimitResult;
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      }

      return response;

    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return NextResponse.json({
        error: 'Internal security error'
      }, { status: 500 });
    }
  };
}

export default withEnterpriseRateLimit;