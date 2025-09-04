// Enterprise Usage Tracking API
// PrismForge AI - Pay-per-Analysis Usage and Billing

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/middleware/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/enterprise/usage - Get usage report
async function getUsageReport(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'annual':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // monthly
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get usage records for organization
    const { data: usageRecords, error } = await supabase
      .from('usage_records')
      .select(`
        *,
        phase2_analysis_sessions(execution_id, status),
        users(first_name, last_name, email, department, cost_center)
      `)
      .eq('organization_id', user.organization_id)
      .gte('recorded_at', startDate.toISOString());
    
    if (error) {
      throw error;
    }
    
    // Calculate summary
    const totalAnalyses = usageRecords.length;
    const totalCostCents = usageRecords.reduce((sum, record) => sum + record.cost_cents, 0);
    const uniqueUsers = new Set(usageRecords.map(r => r.user_id)).size;
    
    // Group by department
    const byDepartment = usageRecords.reduce((acc, record) => {
      const dept = record.users?.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, cost_cents: 0 };
      }
      acc[dept].count++;
      acc[dept].cost_cents += record.cost_cents;
      return acc;
    }, {} as Record<string, { count: number; cost_cents: number }>);
    
    // Group by cost center
    const byCostCenter = usageRecords.reduce((acc, record) => {
      const center = record.users?.cost_center || 'Unknown';
      if (!acc[center]) {
        acc[center] = { count: 0, cost_cents: 0 };
      }
      acc[center].count++;
      acc[center].cost_cents += record.cost_cents;
      return acc;
    }, {} as Record<string, { count: number; cost_cents: number }>);
    
    const report = {
      organization_id: user.organization_id,
      period,
      time_range: { start: startDate, end: now },
      billing_model: 'pay_per_analysis',
      summary: {
        total_analyses: totalAnalyses,
        total_cost_cents: totalCostCents,
        cost_per_analysis_cents: 50000, // $500 per professional validation
        active_users: uniqueUsers,
        cost_savings_vs_traditional_consulting_cents: totalAnalyses * 10000000 // $100k+ savings per analysis
      },
      breakdown: {
        by_department: byDepartment,
        by_cost_center: byCostCenter,
        recent_analyses: usageRecords.slice(0, 10) // Last 10 analyses
      },
      generated_by: user.id,
      generated_at: now
    };
    
    return NextResponse.json({ report });
    
  } catch (error) {
    console.error('Usage report error:', error);
    return NextResponse.json({ error: 'Failed to generate usage report' }, { status: 500 });
  }
}

// Export with authentication middleware
export const GET = withAuth(getUsageReport, 'reports.generate');