// Enterprise Usage Tracker
// PrismForge AI - Cost Attribution and Analytics for Pay-Per-Analysis Model

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { permissionManager } from './permission-manager';

interface UsageRecord {
  analysis_id: string;
  user_id: string;
  organization_id: string;
  team_id?: string;
  cost_cents: number;
  cost_center?: string;
  department?: string;
  billing_model: string;
  analysis_value_cents: number;
  recorded_at: string;
}

interface UsageReport {
  organization_id: string;
  report_type: 'monthly' | 'quarterly' | 'annual';
  time_range: {
    start: string;
    end: string;
  };
  billing_model: string;
  summary: {
    total_analyses: number;
    total_cost_cents: number;
    cost_per_analysis_cents: number;
    active_users: number;
    cost_savings_vs_traditional_consulting_cents: number;
  };
  breakdown: {
    by_user: UserBreakdown[];
    by_department: DepartmentBreakdown[];
    by_cost_center: CostCenterBreakdown[];
    by_month: MonthlyBreakdown[];
    by_analysis_type: AnalysisTypeBreakdown[];
  };
  generated_by: string;
  generated_at: Date;
}

interface UserBreakdown {
  user_id: string;
  email: string;
  full_name?: string;
  department?: string;
  cost_center?: string;
  analyses_count: number;
  total_cost_cents: number;
}

interface DepartmentBreakdown {
  department: string;
  analyses_count: number;
  total_cost_cents: number;
  user_count: number;
}

interface CostCenterBreakdown {
  cost_center: string;
  analyses_count: number;
  total_cost_cents: number;
  user_count: number;
}

interface MonthlyBreakdown {
  month: string;
  analyses_count: number;
  total_cost_cents: number;
  unique_users: number;
}

interface AnalysisTypeBreakdown {
  analysis_type: string;
  analyses_count: number;
  total_cost_cents: number;
  avg_quality_score?: number;
}

interface AnalysisBillingData {
  analysisId: string;
  userId: string;
  organizationId: string;
  amountCents: number;
  costCenter?: string;
  department?: string;
  teamId?: string;
}

interface TimeRange {
  start: Date;
  end: Date;
}

interface UsageData {
  total_analyses: number;
  unique_users: number;
  user_breakdown: UserBreakdown[];
  department_breakdown: DepartmentBreakdown[];
  cost_center_breakdown: CostCenterBreakdown[];
  monthly_breakdown: MonthlyBreakdown[];
  analysis_type_breakdown: AnalysisTypeBreakdown[];
}

export class EnterpriseUsageTracker {
  private readonly ANALYSIS_COST_CENTS = 50000; // $500 per professional validation
  private readonly TRADITIONAL_CONSULTING_COST_CENTS = 10000000; // $100,000+ per traditional analysis

  /**
   * Track analysis usage with cost attribution
   */
  async trackAnalysisUsage(
    analysisId: string,
    userId: string,
    organizationId: string,
    costCents: number = this.ANALYSIS_COST_CENTS,
    teamId?: string
  ): Promise<void> {
    try {
      // Get user with cost center information
      const user = await this.getUserWithCostCenter(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Get team info if provided
      let teamInfo = null;
      if (teamId) {
        const { data: team } = await supabase
          .from('teams')
          .select('id, name')
          .eq('id', teamId)
          .single();
        teamInfo = team;
      }

      // Record usage with cost attribution for pay-per-analysis model
      const { error: usageError } = await supabaseAdmin
        .from('usage_records')
        .insert([{
          analysis_id: analysisId,
          user_id: userId,
          organization_id: organizationId,
          team_id: teamId,
          cost_cents: costCents,
          cost_center: user.cost_center,
          department: user.department,
          billing_model: 'pay_per_analysis',
          analysis_value_cents: costCents
        }]);

      if (usageError) {
        throw new Error(`Failed to record usage: ${usageError.message}`);
      }

      // Create billing record for pay-per-analysis
      await this.createAnalysisBillingRecord({
        analysisId,
        userId,
        organizationId,
        amountCents: costCents,
        costCenter: user.cost_center,
        department: user.department,
        teamId
      });

      // Log audit event
      await this.logAuditEvent(
        organizationId,
        userId,
        'analysis_usage_tracked',
        'analysis',
        analysisId,
        {
          costCents,
          costCenter: user.cost_center,
          department: user.department,
          teamId: teamInfo?.id,
          teamName: teamInfo?.name,
          billingModel: 'pay_per_analysis'
        }
      );

    } catch (error) {
      console.error('Track analysis usage error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive usage report
   */
  async generateUsageReport(
    organizationId: string,
    reportType: 'monthly' | 'quarterly' | 'annual',
    requestedBy: string
  ): Promise<UsageReport> {
    // Verify permissions
    const canViewReports = await permissionManager.checkPermission(
      requestedBy,
      'reports.generate'
    );
    
    if (!canViewReports) {
      throw new Error('Insufficient permissions to generate reports');
    }

    try {
      const timeRange = this.getTimeRange(reportType);
      const usage = await this.getUsageData(organizationId, timeRange);
      
      return {
        organization_id: organizationId,
        report_type: reportType,
        time_range: {
          start: timeRange.start.toISOString(),
          end: timeRange.end.toISOString()
        },
        billing_model: 'pay_per_analysis',
        summary: {
          total_analyses: usage.total_analyses,
          total_cost_cents: usage.total_analyses * this.ANALYSIS_COST_CENTS,
          cost_per_analysis_cents: this.ANALYSIS_COST_CENTS,
          active_users: usage.unique_users,
          cost_savings_vs_traditional_consulting_cents: usage.total_analyses * (this.TRADITIONAL_CONSULTING_COST_CENTS - this.ANALYSIS_COST_CENTS)
        },
        breakdown: {
          by_user: usage.user_breakdown,
          by_department: usage.department_breakdown,
          by_cost_center: usage.cost_center_breakdown,
          by_month: usage.monthly_breakdown,
          by_analysis_type: usage.analysis_type_breakdown
        },
        generated_by: requestedBy,
        generated_at: new Date()
      };

    } catch (error) {
      console.error('Generate usage report error:', error);
      throw error;
    }
  }

  /**
   * Get usage data for organization within time range
   */
  private async getUsageData(organizationId: string, timeRange: TimeRange): Promise<UsageData> {
    try {
      // Get usage records with user info
      const { data: usageRecords, error: usageError } = await supabase
        .from('usage_records')
        .select(`
          *,
          users!inner (
            id,
            email,
            full_name,
            department,
            cost_center
          ),
          analysis_sessions!inner (
            id,
            mode,
            status,
            professional_quality_score
          )
        `)
        .eq('organization_id', organizationId)
        .gte('recorded_at', timeRange.start.toISOString())
        .lte('recorded_at', timeRange.end.toISOString())
        .order('recorded_at', { ascending: false });

      if (usageError) {
        throw new Error(`Failed to get usage data: ${usageError.message}`);
      }

      const records = usageRecords || [];

      // Calculate breakdowns
      const userBreakdown = this.calculateUserBreakdown(records);
      const departmentBreakdown = this.calculateDepartmentBreakdown(records);
      const costCenterBreakdown = this.calculateCostCenterBreakdown(records);
      const monthlyBreakdown = this.calculateMonthlyBreakdown(records);
      const analysisTypeBreakdown = this.calculateAnalysisTypeBreakdown(records);

      return {
        total_analyses: records.length,
        unique_users: new Set(records.map(r => r.user_id)).size,
        user_breakdown: userBreakdown,
        department_breakdown: departmentBreakdown,
        cost_center_breakdown: costCenterBreakdown,
        monthly_breakdown: monthlyBreakdown,
        analysis_type_breakdown: analysisTypeBreakdown
      };

    } catch (error) {
      console.error('Get usage data error:', error);
      throw error;
    }
  }

  /**
   * Calculate user breakdown
   */
  private calculateUserBreakdown(records: any[]): UserBreakdown[] {
    const userMap = new Map<string, UserBreakdown>();

    records.forEach(record => {
      const userId = record.user_id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user_id: userId,
          email: record.users.email,
          full_name: record.users.full_name,
          department: record.users.department,
          cost_center: record.users.cost_center,
          analyses_count: 0,
          total_cost_cents: 0
        });
      }

      const user = userMap.get(userId)!;
      user.analyses_count += 1;
      user.total_cost_cents += record.cost_cents;
    });

    return Array.from(userMap.values())
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents);
  }

  /**
   * Calculate department breakdown
   */
  private calculateDepartmentBreakdown(records: any[]): DepartmentBreakdown[] {
    const departmentMap = new Map<string, DepartmentBreakdown>();
    const departmentUsers = new Map<string, Set<string>>();

    records.forEach(record => {
      const department = record.department || record.users.department || 'Unknown';
      
      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          department,
          analyses_count: 0,
          total_cost_cents: 0,
          user_count: 0
        });
        departmentUsers.set(department, new Set());
      }

      const dept = departmentMap.get(department)!;
      dept.analyses_count += 1;
      dept.total_cost_cents += record.cost_cents;
      
      departmentUsers.get(department)!.add(record.user_id);
    });

    // Update user counts
    departmentMap.forEach((dept, department) => {
      dept.user_count = departmentUsers.get(department)!.size;
    });

    return Array.from(departmentMap.values())
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents);
  }

  /**
   * Calculate cost center breakdown
   */
  private calculateCostCenterBreakdown(records: any[]): CostCenterBreakdown[] {
    const costCenterMap = new Map<string, CostCenterBreakdown>();
    const costCenterUsers = new Map<string, Set<string>>();

    records.forEach(record => {
      const costCenter = record.cost_center || record.users.cost_center || 'Unknown';
      
      if (!costCenterMap.has(costCenter)) {
        costCenterMap.set(costCenter, {
          cost_center: costCenter,
          analyses_count: 0,
          total_cost_cents: 0,
          user_count: 0
        });
        costCenterUsers.set(costCenter, new Set());
      }

      const cc = costCenterMap.get(costCenter)!;
      cc.analyses_count += 1;
      cc.total_cost_cents += record.cost_cents;
      
      costCenterUsers.get(costCenter)!.add(record.user_id);
    });

    // Update user counts
    costCenterMap.forEach((cc, costCenter) => {
      cc.user_count = costCenterUsers.get(costCenter)!.size;
    });

    return Array.from(costCenterMap.values())
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents);
  }

  /**
   * Calculate monthly breakdown
   */
  private calculateMonthlyBreakdown(records: any[]): MonthlyBreakdown[] {
    const monthMap = new Map<string, MonthlyBreakdown>();
    const monthUsers = new Map<string, Set<string>>();

    records.forEach(record => {
      const date = new Date(record.recorded_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(month)) {
        monthMap.set(month, {
          month,
          analyses_count: 0,
          total_cost_cents: 0,
          unique_users: 0
        });
        monthUsers.set(month, new Set());
      }

      const monthData = monthMap.get(month)!;
      monthData.analyses_count += 1;
      monthData.total_cost_cents += record.cost_cents;
      
      monthUsers.get(month)!.add(record.user_id);
    });

    // Update unique user counts
    monthMap.forEach((monthData, month) => {
      monthData.unique_users = monthUsers.get(month)!.size;
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate analysis type breakdown
   */
  private calculateAnalysisTypeBreakdown(records: any[]): AnalysisTypeBreakdown[] {
    const typeMap = new Map<string, AnalysisTypeBreakdown>();
    const qualityScores = new Map<string, number[]>();

    records.forEach(record => {
      const analysisType = record.analysis_sessions.mode || '2_agent';
      
      if (!typeMap.has(analysisType)) {
        typeMap.set(analysisType, {
          analysis_type: analysisType,
          analyses_count: 0,
          total_cost_cents: 0
        });
        qualityScores.set(analysisType, []);
      }

      const type = typeMap.get(analysisType)!;
      type.analyses_count += 1;
      type.total_cost_cents += record.cost_cents;

      if (record.analysis_sessions.professional_quality_score) {
        qualityScores.get(analysisType)!.push(record.analysis_sessions.professional_quality_score);
      }
    });

    // Calculate average quality scores
    typeMap.forEach((type, analysisType) => {
      const scores = qualityScores.get(analysisType)!;
      if (scores.length > 0) {
        type.avg_quality_score = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    return Array.from(typeMap.values())
      .sort((a, b) => b.total_cost_cents - a.total_cost_cents);
  }

  /**
   * Get time range for report type
   */
  private getTimeRange(reportType: 'monthly' | 'quarterly' | 'annual'): TimeRange {
    const end = new Date();
    const start = new Date();

    switch (reportType) {
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'annual':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return { start, end };
  }

  /**
   * Get user with cost center information
   */
  private async getUserWithCostCenter(userId: string): Promise<any> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, full_name, department, cost_center, organization_id')
        .eq('id', userId)
        .single();

      if (error) {
        throw new Error(`Failed to get user: ${error.message}`);
      }

      return user;

    } catch (error) {
      console.error('Get user with cost center error:', error);
      return null;
    }
  }

  /**
   * Create billing record for analysis
   */
  private async createAnalysisBillingRecord(data: AnalysisBillingData): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('analysis_billing_records')
        .insert([{
          analysis_session_id: data.analysisId,
          organization_id: data.organizationId,
          user_id: data.userId,
          amount_cents: data.amountCents,
          cost_center: data.costCenter,
          department: data.department,
          billing_date: new Date().toISOString(),
          payment_status: 'pending'
        }]);

      if (error) {
        throw new Error(`Failed to create billing record: ${error.message}`);
      }

    } catch (error) {
      console.error('Create billing record error:', error);
      throw error;
    }
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
export const enterpriseUsageTracker = new EnterpriseUsageTracker();