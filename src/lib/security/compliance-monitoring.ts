// Enterprise Compliance Monitoring Service
// PrismForge AI - SOC 2, GDPR, SOX, FFIEC Compliance & Security Event Tracking

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { 
  SecurityEvent, 
  ComplianceReport, 
  ComplianceFinding, 
  SecurityAlert,
  AuditContext,
  SecurityEventType
} from '@/types/security.types';
import { permissionManager } from '@/lib/enterprise/permission-manager';

interface ComplianceRule {
  id: string;
  name: string;
  framework: 'soc2' | 'gdpr' | 'sox' | 'ffiec' | 'internal';
  category: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  automated: boolean;
  checkFunction?: string;
  remediation: string;
  enabled: boolean;
}

interface MonitoringThreshold {
  eventType: SecurityEventType;
  timeWindow: number; // milliseconds
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'alert' | 'block' | 'escalate';
}

export class EnterpriseComplianceMonitor {
  private static instance: EnterpriseComplianceMonitor;
  private monitoringThresholds: MonitoringThreshold[] = [];
  private complianceRules: ComplianceRule[] = [];

  constructor() {
    this.initializeDefaultThresholds();
    this.initializeComplianceRules();
    this.startPeriodicCompliance();
  }

  static getInstance(): EnterpriseComplianceMonitor {
    if (!this.instance) {
      this.instance = new EnterpriseComplianceMonitor();
    }
    return this.instance;
  }

  /**
   * Initialize default security monitoring thresholds
   */
  private initializeDefaultThresholds(): void {
    this.monitoringThresholds = [
      {
        eventType: 'authentication_failure',
        timeWindow: 15 * 60 * 1000, // 15 minutes
        threshold: 5,
        severity: 'medium',
        action: 'alert'
      },
      {
        eventType: 'suspicious_login',
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 3,
        severity: 'high',
        action: 'escalate'
      },
      {
        eventType: 'rate_limit_exceeded',
        timeWindow: 5 * 60 * 1000, // 5 minutes
        threshold: 10,
        severity: 'medium',
        action: 'alert'
      },
      {
        eventType: 'unauthorized_access_attempt',
        timeWindow: 30 * 60 * 1000, // 30 minutes
        threshold: 1,
        severity: 'critical',
        action: 'escalate'
      },
      {
        eventType: 'data_export_unusual',
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        threshold: 5,
        severity: 'high',
        action: 'escalate'
      },
      {
        eventType: 'privilege_escalation',
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 1,
        severity: 'critical',
        action: 'escalate'
      },
      {
        eventType: 'mfa_bypass_attempt',
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 1,
        severity: 'critical',
        action: 'block'
      }
    ];
  }

  /**
   * Initialize compliance rules for different frameworks
   */
  private initializeComplianceRules(): void {
    this.complianceRules = [
      // SOC 2 Type II Rules
      {
        id: 'soc2-access-control-001',
        name: 'User Access Reviews',
        framework: 'soc2',
        category: 'Access Control',
        description: 'Regular review of user access rights and permissions',
        riskLevel: 'medium',
        automated: true,
        remediation: 'Review and update user permissions quarterly',
        enabled: true
      },
      {
        id: 'soc2-audit-logging-001',
        name: 'Comprehensive Audit Logging',
        framework: 'soc2',
        category: 'Monitoring',
        description: 'All security-relevant events must be logged and monitored',
        riskLevel: 'high',
        automated: true,
        remediation: 'Ensure audit logging is enabled for all critical systems',
        enabled: true
      },
      {
        id: 'soc2-data-encryption-001',
        name: 'Data Encryption Standards',
        framework: 'soc2',
        category: 'Confidentiality',
        description: 'All sensitive data must be encrypted at rest and in transit',
        riskLevel: 'critical',
        automated: true,
        remediation: 'Implement AES-256 encryption for sensitive data',
        enabled: true
      },

      // GDPR Rules
      {
        id: 'gdpr-consent-001',
        name: 'Data Processing Consent',
        framework: 'gdpr',
        category: 'Privacy',
        description: 'Valid consent must be obtained for personal data processing',
        riskLevel: 'critical',
        automated: false,
        remediation: 'Implement explicit consent mechanisms',
        enabled: true
      },
      {
        id: 'gdpr-data-retention-001',
        name: 'Data Retention Limits',
        framework: 'gdpr',
        category: 'Privacy',
        description: 'Personal data must not be kept longer than necessary',
        riskLevel: 'high',
        automated: true,
        remediation: 'Implement automated data purging based on retention policies',
        enabled: true
      },
      {
        id: 'gdpr-data-breach-001',
        name: 'Data Breach Notification',
        framework: 'gdpr',
        category: 'Incident Response',
        description: 'Data breaches must be reported within 72 hours',
        riskLevel: 'critical',
        automated: true,
        remediation: 'Implement automated breach detection and notification',
        enabled: true
      },

      // SOX Rules
      {
        id: 'sox-financial-controls-001',
        name: 'Financial Data Access Controls',
        framework: 'sox',
        category: 'Financial Controls',
        description: 'Strict access controls for financial data and reports',
        riskLevel: 'critical',
        automated: true,
        remediation: 'Implement segregation of duties for financial processes',
        enabled: true
      },
      {
        id: 'sox-change-management-001',
        name: 'IT Change Management',
        framework: 'sox',
        category: 'Change Control',
        description: 'All IT changes affecting financial reporting must be documented',
        riskLevel: 'high',
        automated: false,
        remediation: 'Implement formal change approval process',
        enabled: true
      },

      // FFIEC Rules
      {
        id: 'ffiec-authentication-001',
        name: 'Multi-Factor Authentication',
        framework: 'ffiec',
        category: 'Authentication',
        description: 'Multi-factor authentication required for sensitive operations',
        riskLevel: 'critical',
        automated: true,
        remediation: 'Implement MFA for all privileged accounts',
        enabled: true
      },
      {
        id: 'ffiec-monitoring-001',
        name: 'Continuous Monitoring',
        framework: 'ffiec',
        category: 'Monitoring',
        description: 'Continuous monitoring of all financial systems and data access',
        riskLevel: 'high',
        automated: true,
        remediation: 'Deploy real-time monitoring and alerting systems',
        enabled: true
      }
    ];
  }

  /**
   * Log security event and trigger compliance checks
   */
  async logSecurityEvent(
    event: Partial<SecurityEvent>,
    context?: AuditContext
  ): Promise<string> {
    try {
      // Enrich event with additional context
      const enrichedEvent = await this.enrichSecurityEvent(event, context);
      
      // Store security event
      const { data: storedEvent, error } = await supabaseAdmin
        .from('security_events')
        .insert([enrichedEvent])
        .select()
        .single();

      if (error) {
        console.error('Failed to store security event:', error);
        throw error;
      }

      // Check monitoring thresholds
      await this.checkMonitoringThresholds(enrichedEvent);

      // Trigger compliance rule evaluation
      await this.evaluateComplianceRules(enrichedEvent);

      // Check if event requires immediate escalation
      await this.checkEscalationCriteria(enrichedEvent);

      return storedEvent.id;

    } catch (error) {
      console.error('Error logging security event:', error);
      throw error;
    }
  }

  /**
   * Enrich security event with additional context
   */
  private async enrichSecurityEvent(
    event: Partial<SecurityEvent>,
    context?: AuditContext
  ): Promise<any> {
    const enriched = {
      id: crypto.randomUUID(),
      organization_id: event.organizationId || context?.organizationId,
      user_id: event.userId || context?.userId,
      event_type: event.eventType,
      severity: event.severity || 'medium',
      source: event.source || 'unknown',
      description: event.description || '',
      ip_address: event.ipAddress || context?.ipAddress,
      user_agent: event.userAgent || context?.userAgent,
      device_fingerprint: event.deviceFingerprint || context?.deviceFingerprint,
      location: event.location || context?.location,
      risk_score: event.riskScore || 50,
      mitigation_actions: event.mitigationActions || [],
      status: event.status || 'open',
      metadata: {
        ...event.metadata,
        context,
        enrichedAt: new Date().toISOString()
      },
      detected_at: event.detectedAt || new Date(),
      resolved_at: event.resolvedAt
    };

    // Add geolocation if IP available
    if (enriched.ip_address && !enriched.location) {
      try {
        enriched.location = await this.getIPLocation(enriched.ip_address);
      } catch (error) {
        // Ignore geolocation errors
      }
    }

    return enriched;
  }

  /**
   * Check if event exceeds monitoring thresholds
   */
  private async checkMonitoringThresholds(event: any): Promise<void> {
    if (!event.organization_id) return;

    const relevantThresholds = this.monitoringThresholds.filter(
      threshold => threshold.eventType === event.event_type
    );

    for (const threshold of relevantThresholds) {
      const windowStart = new Date(Date.now() - threshold.timeWindow);
      
      // Count similar events in time window
      const { count, error } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', event.organization_id)
        .eq('event_type', event.event_type)
        .gte('detected_at', windowStart.toISOString());

      if (error) {
        console.error('Error checking threshold:', error);
        continue;
      }

      if (count && count >= threshold.threshold) {
        await this.handleThresholdExceeded(event, threshold, count);
      }
    }
  }

  /**
   * Handle threshold exceeded scenarios
   */
  private async handleThresholdExceeded(
    event: any,
    threshold: MonitoringThreshold,
    count: number
  ): Promise<void> {
    const alert: Partial<SecurityAlert> = {
      id: crypto.randomUUID(),
      organizationId: event.organization_id,
      alertType: 'threshold_exceeded',
      severity: threshold.severity,
      title: `${threshold.eventType} threshold exceeded`,
      description: `${count} occurrences of ${threshold.eventType} in ${threshold.timeWindow/60000} minutes`,
      affectedUsers: [event.user_id].filter(Boolean),
      affectedResources: [],
      triggerConditions: { threshold, count },
      recommendedActions: this.getRecommendedActions(threshold),
      status: 'active',
      createdAt: new Date(),
      metadata: { originalEvent: event, threshold }
    };

    // Store alert
    await supabaseAdmin
      .from('security_alerts')
      .insert([{
        id: alert.id,
        organization_id: alert.organizationId,
        alert_type: alert.alertType,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        affected_users: alert.affectedUsers,
        affected_resources: alert.affectedResources,
        trigger_conditions: alert.triggerConditions,
        recommended_actions: alert.recommendedActions,
        status: alert.status,
        created_at: alert.createdAt,
        metadata: alert.metadata
      }]);

    // Execute threshold action
    await this.executeThresholdAction(threshold, event, alert);
  }

  /**
   * Execute action based on threshold configuration
   */
  private async executeThresholdAction(
    threshold: MonitoringThreshold,
    event: any,
    alert: Partial<SecurityAlert>
  ): Promise<void> {
    switch (threshold.action) {
      case 'log':
        console.warn(`Security threshold exceeded: ${alert.title}`);
        break;

      case 'alert':
        await this.sendSecurityAlert(alert);
        break;

      case 'block':
        await this.blockUser(event.user_id, `Threshold exceeded: ${threshold.eventType}`);
        break;

      case 'escalate':
        await this.escalateToSecurity(event, alert);
        break;
    }
  }

  /**
   * Evaluate compliance rules against security event
   */
  private async evaluateComplianceRules(event: any): Promise<void> {
    const applicableRules = this.complianceRules.filter(rule => 
      rule.enabled && rule.automated
    );

    for (const rule of applicableRules) {
      try {
        const finding = await this.evaluateRule(rule, event);
        if (finding) {
          await this.recordComplianceFinding(finding);
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }
  }

  /**
   * Evaluate individual compliance rule
   */
  private async evaluateRule(
    rule: ComplianceRule, 
    event: any
  ): Promise<Partial<ComplianceFinding> | null> {
    // Rule-specific evaluation logic
    switch (rule.id) {
      case 'soc2-audit-logging-001':
        return this.evaluateAuditLogging(rule, event);
      
      case 'gdpr-data-breach-001':
        return this.evaluateDataBreach(rule, event);
      
      case 'sox-financial-controls-001':
        return this.evaluateFinancialControls(rule, event);
      
      case 'ffiec-authentication-001':
        return this.evaluateAuthentication(rule, event);
      
      default:
        return null;
    }
  }

  /**
   * SOC 2 Audit Logging Evaluation
   */
  private async evaluateAuditLogging(
    rule: ComplianceRule, 
    event: any
  ): Promise<Partial<ComplianceFinding> | null> {
    // Check if critical events are being properly logged
    const criticalEvents = [
      'authentication_failure',
      'privilege_escalation',
      'data_export_unusual',
      'unauthorized_access_attempt'
    ];

    if (criticalEvents.includes(event.event_type)) {
      // This is good - critical event is being logged
      return null;
    }

    // Check for missing audit trails
    if (event.event_type === 'admin_action_unusual' && !event.metadata?.auditTrail) {
      return {
        id: crypto.randomUUID(),
        category: rule.category,
        title: 'Missing Audit Trail',
        description: `Administrative action without proper audit trail: ${event.description}`,
        severity: 'medium',
        status: 'open',
        evidence: [event],
        remediation: 'Ensure all administrative actions include detailed audit trails',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * GDPR Data Breach Evaluation
   */
  private async evaluateDataBreach(
    rule: ComplianceRule, 
    event: any
  ): Promise<Partial<ComplianceFinding> | null> {
    const breachIndicators = [
      'data_breach_attempt',
      'unauthorized_access_attempt',
      'data_export_unusual'
    ];

    if (breachIndicators.includes(event.event_type) && event.severity === 'critical') {
      return {
        id: crypto.randomUUID(),
        category: rule.category,
        title: 'Potential Data Breach',
        description: `Potential data breach detected: ${event.description}`,
        severity: 'critical',
        status: 'open',
        evidence: [event],
        remediation: 'Investigate immediately and notify authorities if confirmed breach',
        dueDate: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * SOX Financial Controls Evaluation
   */
  private async evaluateFinancialControls(
    rule: ComplianceRule, 
    event: any
  ): Promise<Partial<ComplianceFinding> | null> {
    // Check for unauthorized access to financial data
    if (event.event_type === 'unauthorized_access_attempt' && 
        event.metadata?.resourceType === 'financial_report') {
      return {
        id: crypto.randomUUID(),
        category: rule.category,
        title: 'Unauthorized Financial Data Access',
        description: `Unauthorized attempt to access financial data: ${event.description}`,
        severity: 'high',
        status: 'open',
        evidence: [event],
        remediation: 'Review and strengthen financial data access controls',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * FFIEC Authentication Evaluation
   */
  private async evaluateAuthentication(
    rule: ComplianceRule, 
    event: any
  ): Promise<Partial<ComplianceFinding> | null> {
    // Check for high-privilege operations without MFA
    if (event.event_type === 'privilege_escalation' && 
        !event.metadata?.mfaVerified) {
      return {
        id: crypto.randomUUID(),
        category: rule.category,
        title: 'Privilege Escalation Without MFA',
        description: `Privilege escalation performed without MFA verification: ${event.description}`,
        severity: 'high',
        status: 'open',
        evidence: [event],
        remediation: 'Enforce MFA for all privilege escalation operations',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return null;
  }

  /**
   * Record compliance finding
   */
  private async recordComplianceFinding(finding: Partial<ComplianceFinding>): Promise<void> {
    await supabaseAdmin
      .from('compliance_findings')
      .insert([{
        id: finding.id,
        category: finding.category,
        title: finding.title,
        description: finding.description,
        severity: finding.severity,
        status: finding.status,
        evidence: finding.evidence,
        remediation: finding.remediation,
        due_date: finding.dueDate,
        assigned_to: finding.assignedTo,
        created_at: finding.createdAt,
        updated_at: finding.updatedAt
      }]);
  }

  /**
   * Check escalation criteria for security events
   */
  private async checkEscalationCriteria(event: any): Promise<void> {
    const escalationCriteria = [
      event.severity === 'critical',
      event.event_type === 'data_breach_attempt',
      event.event_type === 'privilege_escalation',
      event.risk_score >= 90
    ];

    if (escalationCriteria.some(criteria => criteria)) {
      await this.escalateToSecurity(event);
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    organizationId: string,
    framework: 'soc2' | 'gdpr' | 'sox' | 'ffiec',
    periodStart: Date,
    periodEnd: Date
  ): Promise<ComplianceReport> {
    try {
      // Get all relevant findings for the period
      const { data: findings } = await supabase
        .from('compliance_findings')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString());

      // Get relevant security events
      const { data: events } = await supabase
        .from('security_events')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('detected_at', periodStart.toISOString())
        .lte('detected_at', periodEnd.toISOString());

      const report: ComplianceReport = {
        id: crypto.randomUUID(),
        organizationId,
        reportType: framework,
        periodStart,
        periodEnd,
        status: 'draft',
        findings: findings || [],
        recommendations: this.generateRecommendations(framework, findings, events),
        riskLevel: this.calculateOverallRiskLevel(findings),
        generatedAt: new Date(),
        generatedBy: 'compliance_monitor_system',
        metadata: {
          totalFindings: findings?.length || 0,
          totalEvents: events?.length || 0,
          framework,
          complianceRules: this.complianceRules.filter(r => r.framework === framework)
        }
      };

      // Store report
      await supabaseAdmin
        .from('compliance_reports')
        .insert([{
          id: report.id,
          organization_id: report.organizationId,
          report_type: report.reportType,
          period_start: report.periodStart,
          period_end: report.periodEnd,
          status: report.status,
          findings: report.findings,
          recommendations: report.recommendations,
          risk_level: report.riskLevel,
          generated_at: report.generatedAt,
          generated_by: report.generatedBy,
          metadata: report.metadata
        }]);

      return report;

    } catch (error) {
      console.error('Error generating compliance report:', error);
      throw error;
    }
  }

  /**
   * Start periodic compliance monitoring
   */
  private startPeriodicCompliance(): void {
    // Run compliance checks every hour
    setInterval(async () => {
      try {
        await this.runPeriodicComplianceChecks();
      } catch (error) {
        console.error('Periodic compliance check error:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Run periodic compliance checks
   */
  private async runPeriodicComplianceChecks(): Promise<void> {
    console.log('Running periodic compliance checks...');
    
    // Check for stale security events
    await this.checkStaleSecurityEvents();
    
    // Review open compliance findings
    await this.reviewOpenFindings();
    
    // Generate compliance metrics
    await this.updateComplianceMetrics();
  }

  /**
   * Helper methods
   */
  private async getIPLocation(ipAddress: string): Promise<any> {
    // Mock implementation - in production, use real IP geolocation service
    return {
      country: 'US',
      region: 'California',
      city: 'San Francisco'
    };
  }

  private getRecommendedActions(threshold: MonitoringThreshold): string[] {
    const actions = {
      'authentication_failure': [
        'Review user account for compromise',
        'Consider temporary account lockout',
        'Enable additional monitoring'
      ],
      'rate_limit_exceeded': [
        'Investigate potential bot activity',
        'Consider IP blocking if malicious',
        'Review rate limiting policies'
      ],
      'unauthorized_access_attempt': [
        'Immediate security investigation required',
        'Block source IP if confirmed malicious',
        'Review access controls'
      ]
    };

    return actions[threshold.eventType as keyof typeof actions] || [
      'Investigate security event',
      'Review security controls',
      'Consider preventive measures'
    ];
  }

  private async sendSecurityAlert(alert: Partial<SecurityAlert>): Promise<void> {
    // Implementation would send alert via email, Slack, etc.
    console.log(`Security Alert: ${alert.title}`);
  }

  private async blockUser(userId: string, reason: string): Promise<void> {
    if (!userId) return;
    
    try {
      await supabaseAdmin
        .from('users')
        .update({ status: 'suspended' })
        .eq('id', userId);
      
      console.log(`User ${userId} blocked: ${reason}`);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  private async escalateToSecurity(event: any, alert?: Partial<SecurityAlert>): Promise<void> {
    // Implementation would escalate to security team
    console.log(`SECURITY ESCALATION: ${event.description}`);
  }

  private generateRecommendations(
    framework: string,
    findings: any[],
    events: any[]
  ): string[] {
    const recommendations = [];
    
    if (findings?.some(f => f.severity === 'critical')) {
      recommendations.push('Address all critical findings immediately');
    }
    
    if (events?.some(e => e.event_type === 'authentication_failure')) {
      recommendations.push('Review and strengthen authentication controls');
    }
    
    return recommendations;
  }

  private calculateOverallRiskLevel(findings: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (!findings || findings.length === 0) return 'low';
    
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (findings.length > 5) return 'medium';
    
    return 'low';
  }

  private async checkStaleSecurityEvents(): Promise<void> {
    // Check for security events that haven't been resolved within SLA
    const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    
    const { data: staleEvents } = await supabase
      .from('security_events')
      .select('*')
      .eq('status', 'open')
      .lt('detected_at', staleCutoff.toISOString());

    if (staleEvents && staleEvents.length > 0) {
      console.warn(`Found ${staleEvents.length} stale security events`);
    }
  }

  private async reviewOpenFindings(): Promise<void> {
    // Check for overdue compliance findings
    const { data: overdueFindings } = await supabase
      .from('compliance_findings')
      .select('*')
      .eq('status', 'open')
      .lt('due_date', new Date().toISOString());

    if (overdueFindings && overdueFindings.length > 0) {
      console.warn(`Found ${overdueFindings.length} overdue compliance findings`);
    }
  }

  private async updateComplianceMetrics(): Promise<void> {
    // Update compliance dashboard metrics
    console.log('Updating compliance metrics...');
  }
}

// Export singleton instance
export const complianceMonitor = EnterpriseComplianceMonitor.getInstance();