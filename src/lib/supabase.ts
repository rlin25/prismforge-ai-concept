import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Professional Supabase Configuration for PrismForge AI
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client (uses RLS policies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (bypasses RLS for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Professional Constants
export const PROFESSIONAL_VALIDATION_COST_CENTS = 50000; // $500
export const PROFESSIONAL_QUALITY_THRESHOLD = 0.85; // ≥85%
export const TOKEN_BUDGETS = {
  SKEPTIC_AGENT: 35000,
  VALIDATOR_AGENT: 35000,
  SYNTHESIS_AGENT: 10000,
  TOTAL: 80000,
} as const;

// Professional Authentication Helpers
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organizations (
        id,
        name,
        plan_type,
        settings
      )
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  return data;
}

// Professional Organization Management
export async function getOrganizationMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      email,
      full_name,
      role,
      status,
      last_login,
      created_at
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch organization members: ${error.message}`);
  }

  return data;
}

// Professional Session Management
export async function createChatSession(
  userId: string,
  organizationId: string,
  title?: string
) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      organization_id: organizationId,
      title: title || 'New M&A Analysis Session',
      phase: '1', // Start in FREE Phase 1
      cost_cents: 0, // Phase 1 is completely free
      token_usage: 0,
      transition_readiness: false,
      refined_objectives: {},
      preliminary_insights: [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create chat session: ${error.message}`);
  }

  return data;
}

export async function getChatSession(sessionId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      *,
      chat_messages (
        id,
        role,
        content,
        metadata,
        token_count,
        created_at
      )
    `)
    .eq('id', sessionId)
    .order('created_at', { foreignTable: 'chat_messages', ascending: true })
    .single();

  if (error) {
    throw new Error(`Failed to fetch chat session: ${error.message}`);
  }

  return data;
}

// Professional Analysis Management
export async function createAnalysisSession(
  chatSessionId: string,
  userId: string,
  organizationId: string
) {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .insert({
      chat_session_id: chatSessionId,
      user_id: userId,
      organization_id: organizationId,
      mode: '2_agent',
      status: 'pending',
      cost_cents: PROFESSIONAL_VALIDATION_COST_CENTS,
      token_usage: 0,
      billing_status: 'pending',
      shared_with_organization: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create analysis session: ${error.message}`);
  }

  // Create agent executions for the professional validation
  await createAgentExecutions(data.id);

  return data;
}

async function createAgentExecutions(analysisSessionId: string) {
  const agentConfigs = [
    {
      session_id: analysisSessionId,
      agent_type: 'skeptic' as const,
      // token_budget will be set by database trigger
    },
    {
      session_id: analysisSessionId,
      agent_type: 'validator' as const,
      // token_budget will be set by database trigger
    },
    {
      session_id: analysisSessionId,
      agent_type: 'synthesis' as const,
      // token_budget will be set by database trigger
    },
  ];

  const { error } = await supabase
    .from('agent_executions')
    .insert(agentConfigs);

  if (error) {
    throw new Error(`Failed to create agent executions: ${error.message}`);
  }
}

export async function getAnalysisSession(sessionId: string) {
  const { data, error } = await supabase
    .from('analysis_sessions')
    .select(`
      *,
      agent_executions (*),
      quality_assessments (*),
      analysis_billing_records (*)
    `)
    .eq('id', sessionId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch analysis session: ${error.message}`);
  }

  return data;
}

// Professional Quality Assessment
export async function calculateProfessionalQualityScore(
  analysisSessionId: string,
  metrics: Partial<{
    internalConsistencyScore: number;
    evidenceStrengthScore: number;
    recommendationLogicScore: number;
  }>
) {
  const overallScore = Object.values(metrics)
    .filter(score => score !== undefined)
    .reduce((sum, score) => sum + score!, 0) / Object.keys(metrics).length;

  const professionalStandardMet = overallScore >= PROFESSIONAL_QUALITY_THRESHOLD;

  const { data, error } = await supabase
    .from('quality_assessments')
    .insert({
      analysis_session_id: analysisSessionId,
      internal_consistency_score: metrics.internalConsistencyScore,
      evidence_strength_score: metrics.evidenceStrengthScore,
      recommendation_logic_score: metrics.recommendationLogicScore,
      overall_quality_score: overallScore,
      methodology_applied: true,
      quality_assurance_passed: true,
      professional_standard_met: professionalStandardMet,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create quality assessment: ${error.message}`);
  }

  // Update the analysis session with the professional quality score
  await supabase
    .from('analysis_sessions')
    .update({ professional_quality_score: overallScore })
    .eq('id', analysisSessionId);

  return data;
}

// Professional Billing Management
export async function createBillingRecord(
  analysisSessionId: string,
  organizationId: string,
  userId: string,
  metadata?: {
    costCenter?: string;
    department?: string;
    projectReference?: string;
  }
) {
  const { data, error } = await supabase
    .from('analysis_billing_records')
    .insert({
      analysis_session_id: analysisSessionId,
      organization_id: organizationId,
      user_id: userId,
      amount_cents: PROFESSIONAL_VALIDATION_COST_CENTS,
      currency: 'USD',
      payment_status: 'pending',
      cost_center: metadata?.costCenter,
      department: metadata?.department,
      project_reference: metadata?.projectReference,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create billing record: ${error.message}`);
  }

  return data;
}

// Professional Real-time Subscriptions
export function subscribeToAnalysisProgress(
  analysisSessionId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('analysis_progress')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'agent_executions',
        filter: `session_id=eq.${analysisSessionId}`,
      },
      callback
    )
    .subscribe();
}

// Error Handling Helpers
export class PrismForgeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'PrismForgeError';
  }
}

export function handleSupabaseError(error: any): never {
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        throw new PrismForgeError('Resource not found', 'NOT_FOUND', 404);
      case '23505':
        throw new PrismForgeError('Resource already exists', 'CONFLICT', 409);
      case '42501':
        throw new PrismForgeError('Access denied', 'FORBIDDEN', 403);
      default:
        throw new PrismForgeError(
          error.message || 'Database operation failed',
          error.code,
          500
        );
    }
  }
  throw new PrismForgeError('Unknown database error', 'UNKNOWN', 500);
}