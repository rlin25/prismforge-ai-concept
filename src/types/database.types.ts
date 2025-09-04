// PrismForge AI - Enterprise Database Types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          plan_type: 'individual' | 'team' | 'enterprise';
          settings: Record<string, unknown>;
          billing_settings: Record<string, unknown>;
          usage_limits: Record<string, unknown>;
          domain_whitelist: string[] | null;
          sso_configuration: Record<string, unknown>;
          default_payment_method: Record<string, unknown>;
          auto_approve_limit_cents: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan_type?: 'individual' | 'team' | 'enterprise';
          settings?: Record<string, unknown>;
          billing_settings?: Record<string, unknown>;
          usage_limits?: Record<string, unknown>;
          domain_whitelist?: string[] | null;
          sso_configuration?: Record<string, unknown>;
          default_payment_method?: Record<string, unknown>;
          auto_approve_limit_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          plan_type?: 'individual' | 'team' | 'enterprise';
          settings?: Record<string, unknown>;
          billing_settings?: Record<string, unknown>;
          usage_limits?: Record<string, unknown>;
          domain_whitelist?: string[] | null;
          sso_configuration?: Record<string, unknown>;
          default_payment_method?: Record<string, unknown>;
          auto_approve_limit_cents?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          organization_id: string;
          role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
          auth_provider: 'email' | 'google' | 'microsoft' | 'saml';
          auth_provider_id: string | null;
          encrypted_password: string | null;
          full_name: string | null;
          job_title: string | null;
          department: string | null;
          cost_center: string | null;
          analysis_approval_limit_cents: number;
          status: 'active' | 'inactive' | 'suspended';
          last_login: string | null;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          organization_id: string;
          role?: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
          auth_provider: 'email' | 'google' | 'microsoft' | 'saml';
          auth_provider_id?: string | null;
          encrypted_password?: string | null;
          full_name?: string | null;
          job_title?: string | null;
          department?: string | null;
          cost_center?: string | null;
          analysis_approval_limit_cents?: number;
          status?: 'active' | 'inactive' | 'suspended';
          last_login?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          organization_id?: string;
          role?: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
          auth_provider?: 'email' | 'google' | 'microsoft' | 'saml';
          auth_provider_id?: string | null;
          encrypted_password?: string | null;
          full_name?: string | null;
          job_title?: string | null;
          department?: string | null;
          cost_center?: string | null;
          analysis_approval_limit_cents?: number;
          status?: 'active' | 'inactive' | 'suspended';
          last_login?: string | null;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          title: string | null;
          document_metadata: Record<string, unknown>[];
          context_summary: string | null;
          token_usage: number;
          cost_cents: number;
          phase: '1' | '2';
          transition_readiness: boolean;
          professional_quality_score: number | null;
          refined_objectives: Record<string, unknown>;
          preliminary_insights: Record<string, unknown>[];
          recommended_validation_mode: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          title?: string | null;
          document_metadata?: Record<string, unknown>[];
          context_summary?: string | null;
          token_usage?: number;
          cost_cents?: number;
          phase?: '1' | '2';
          transition_readiness?: boolean;
          professional_quality_score?: number | null;
          refined_objectives?: Record<string, unknown>;
          preliminary_insights?: Record<string, unknown>[];
          recommended_validation_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          organization_id?: string;
          title?: string | null;
          document_metadata?: Record<string, unknown>[];
          context_summary?: string | null;
          token_usage?: number;
          cost_cents?: number;
          phase?: '1' | '2';
          transition_readiness?: boolean;
          professional_quality_score?: number | null;
          refined_objectives?: Record<string, unknown>;
          preliminary_insights?: Record<string, unknown>[];
          recommended_validation_mode?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: Record<string, unknown>;
          token_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: Record<string, unknown>;
          token_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          metadata?: Record<string, unknown>;
          token_count?: number;
          created_at?: string;
        };
      };
      analysis_sessions: {
        Row: {
          id: string;
          chat_session_id: string | null;
          user_id: string;
          organization_id: string;
          mode: '2_agent';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          cost_cents: number;
          results: Record<string, unknown> | null;
          professional_quality_score: number | null;
          token_usage: number;
          processing_time_ms: number | null;
          team_id: string | null;
          shared_with_organization: boolean;
          billing_status: 'pending' | 'approved' | 'paid' | 'failed';
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          chat_session_id?: string | null;
          user_id: string;
          organization_id: string;
          mode?: '2_agent';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          cost_cents?: number;
          results?: Record<string, unknown> | null;
          professional_quality_score?: number | null;
          token_usage?: number;
          processing_time_ms?: number | null;
          team_id?: string | null;
          shared_with_organization?: boolean;
          billing_status?: 'pending' | 'approved' | 'paid' | 'failed';
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          chat_session_id?: string | null;
          user_id?: string;
          organization_id?: string;
          mode?: '2_agent';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          cost_cents?: number;
          results?: Record<string, unknown> | null;
          professional_quality_score?: number | null;
          token_usage?: number;
          processing_time_ms?: number | null;
          team_id?: string | null;
          shared_with_organization?: boolean;
          billing_status?: 'pending' | 'approved' | 'paid' | 'failed';
          created_at?: string;
          completed_at?: string | null;
        };
      };
      agent_executions: {
        Row: {
          id: string;
          session_id: string;
          agent_type: 'skeptic' | 'validator' | 'synthesis';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          progress: number;
          current_task: string | null;
          findings: Record<string, unknown>[];
          confidence_score: number | null;
          token_usage: number;
          token_budget: number;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          agent_type: 'skeptic' | 'validator' | 'synthesis';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number;
          current_task?: string | null;
          findings?: Record<string, unknown>[];
          confidence_score?: number | null;
          token_usage?: number;
          token_budget?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          agent_type?: 'skeptic' | 'validator' | 'synthesis';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          progress?: number;
          current_task?: string | null;
          findings?: Record<string, unknown>[];
          confidence_score?: number | null;
          token_usage?: number;
          token_budget?: number;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      quality_assessments: {
        Row: {
          id: string;
          analysis_session_id: string;
          internal_consistency_score: number | null;
          evidence_strength_score: number | null;
          recommendation_logic_score: number | null;
          overall_quality_score: number | null;
          methodology_applied: boolean;
          quality_assurance_passed: boolean;
          professional_standard_met: boolean;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          analysis_session_id: string;
          internal_consistency_score?: number | null;
          evidence_strength_score?: number | null;
          recommendation_logic_score?: number | null;
          overall_quality_score?: number | null;
          methodology_applied?: boolean;
          quality_assurance_passed?: boolean;
          professional_standard_met?: boolean;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          analysis_session_id?: string;
          internal_consistency_score?: number | null;
          evidence_strength_score?: number | null;
          recommendation_logic_score?: number | null;
          overall_quality_score?: number | null;
          methodology_applied?: boolean;
          quality_assurance_passed?: boolean;
          professional_standard_met?: boolean;
          calculated_at?: string;
        };
      };
      analysis_billing_records: {
        Row: {
          id: string;
          analysis_session_id: string;
          organization_id: string;
          user_id: string;
          amount_cents: number;
          currency: string;
          billing_date: string;
          payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
          cost_center: string | null;
          department: string | null;
          project_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          analysis_session_id: string;
          organization_id: string;
          user_id: string;
          amount_cents?: number;
          currency?: string;
          billing_date?: string;
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
          cost_center?: string | null;
          department?: string | null;
          project_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          analysis_session_id?: string;
          organization_id?: string;
          user_id?: string;
          amount_cents?: number;
          currency?: string;
          billing_date?: string;
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
          cost_center?: string | null;
          department?: string | null;
          project_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Professional Agent Types
export type AgentType = 'skeptic' | 'validator' | 'synthesis';
export type AgentStatus = 'idle' | 'processing' | 'complete' | 'error';
export type AnalysisPhase = '1' | '2';
export type ProfessionalQualityStatus = 'professional' | 'warning' | 'error';

// Professional Analysis Configuration
export interface AgentCard {
  agentType: AgentType;
  status: AgentStatus;
  progress: number;
  currentTask: string;
  findings: Finding[];
  confidenceScore: number;
  processingTime: number;
  tokenUsage: number;
  tokenBudget: number;
}

export interface Finding {
  id: string;
  type: 'risk' | 'opportunity' | 'validation' | 'concern';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  evidence: string[];
}

// Professional Quality Assessment
export interface ProfessionalQualityMetrics {
  internalConsistencyScore: number;
  evidenceStrengthScore: number;
  recommendationLogicScore: number;
  overallQualityScore: number;
  methodologyApplied: boolean;
  qualityAssurancePassed: boolean;
  professionalStandardMet: boolean;
}

// Enterprise Organization Types
export interface OrganizationSettings {
  allowedDomains?: string[];
  defaultRole?: string;
  autoApprovalLimits?: Record<string, number>;
  analysisSettings?: {
    defaultTokenBudget?: number;
    qualityThreshold?: number;
    requiredApprovals?: number;
  };
}

// Professional User Context
export interface UserContext {
  organizationId: string;
  role: string;
  approvalLimits: number;
  department?: string;
  costCenter?: string;
}