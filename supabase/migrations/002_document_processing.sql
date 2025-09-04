-- Document processing tables for Phase 1 FREE document processing
-- PrismForge AI - Phase 1 Implementation

-- Document processing tracking
CREATE TABLE IF NOT EXISTS document_processing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'xlsx', 'xls', 'csv')),
    file_size_bytes INTEGER NOT NULL,
    processing_status TEXT NOT NULL CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    
    -- Processing results
    extracted_data JSONB DEFAULT '{}',
    document_summary TEXT,
    key_insights JSONB DEFAULT '[]',
    classification TEXT,
    
    -- Token and cost tracking (FREE for Phase 1)
    token_usage INTEGER DEFAULT 0,
    processing_cost_cents INTEGER DEFAULT 0, -- Always 0 for Phase 1
    
    -- Enterprise context
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Processing metadata
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token usage tracking per session (FREE for Phase 1)
CREATE TABLE IF NOT EXISTS session_token_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    -- Token tracking
    total_tokens_used INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    
    -- Budget management
    token_budget INTEGER DEFAULT 15000, -- 15K tokens for Phase 1
    warning_threshold INTEGER DEFAULT 12000, -- 80% warning
    hard_stop_threshold INTEGER DEFAULT 14250, -- 95% hard stop
    
    -- Cost tracking (always $0 for Phase 1)
    total_cost_cents INTEGER DEFAULT 0,
    
    -- Status tracking
    budget_status TEXT DEFAULT 'normal' CHECK (budget_status IN ('normal', 'warning', 'near_limit', 'exceeded')),
    can_continue BOOLEAN DEFAULT TRUE,
    
    -- Enterprise context
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual API call tracking
CREATE TABLE IF NOT EXISTS api_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    
    -- API call details
    api_provider TEXT NOT NULL DEFAULT 'anthropic',
    model_used TEXT NOT NULL DEFAULT 'claude-sonnet-4-20250514',
    
    -- Token usage
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
    
    -- Cost tracking (always $0 for Phase 1)
    cost_cents INTEGER DEFAULT 0,
    
    -- Performance tracking
    response_time_ms INTEGER,
    request_timestamp TIMESTAMPTZ DEFAULT NOW(),
    response_timestamp TIMESTAMPTZ,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'timeout')) DEFAULT 'pending',
    error_message TEXT,
    
    -- Enterprise context
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context optimization tracking
CREATE TABLE IF NOT EXISTS context_optimization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    -- Optimization details
    original_context_tokens INTEGER,
    optimized_context_tokens INTEGER,
    compression_ratio DECIMAL(4,2) GENERATED ALWAYS AS 
        (CASE WHEN original_context_tokens > 0 
         THEN ROUND((optimized_context_tokens::decimal / original_context_tokens::decimal), 2) 
         ELSE 0 END) STORED,
    
    -- Optimization strategy used
    strategy TEXT NOT NULL,
    optimization_metadata JSONB DEFAULT '{}',
    
    -- Performance
    optimization_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 2 transition readiness tracking
CREATE TABLE IF NOT EXISTS phase2_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    
    -- Readiness assessment
    is_ready BOOLEAN DEFAULT FALSE,
    readiness_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
    
    -- Context quality metrics
    documents_processed INTEGER DEFAULT 0,
    key_insights_identified INTEGER DEFAULT 0,
    questions_refined INTEGER DEFAULT 0,
    context_completeness_score DECIMAL(3,2) DEFAULT 0,
    
    -- Transition data preparation
    context_summary TEXT,
    analysis_objectives JSONB DEFAULT '{}',
    preliminary_insights JSONB DEFAULT '[]',
    identified_risks JSONB DEFAULT '[]',
    
    -- Token budget for Phase 2 handoff
    optimized_context_tokens INTEGER,
    phase2_context JSONB DEFAULT '{}',
    
    -- Enterprise context
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_processing_session ON document_processing(session_id);
CREATE INDEX IF NOT EXISTS idx_document_processing_status ON document_processing(processing_status);
CREATE INDEX IF NOT EXISTS idx_document_processing_org ON document_processing(organization_id);

CREATE INDEX IF NOT EXISTS idx_session_token_usage_session ON session_token_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_session_token_usage_org ON session_token_usage(organization_id);

CREATE INDEX IF NOT EXISTS idx_api_calls_session ON api_calls(session_id);
CREATE INDEX IF NOT EXISTS idx_api_calls_timestamp ON api_calls(request_timestamp);
CREATE INDEX IF NOT EXISTS idx_api_calls_org ON api_calls(organization_id);

CREATE INDEX IF NOT EXISTS idx_context_optimization_session ON context_optimization(session_id);

CREATE INDEX IF NOT EXISTS idx_phase2_readiness_session ON phase2_readiness(session_id);
CREATE INDEX IF NOT EXISTS idx_phase2_readiness_ready ON phase2_readiness(is_ready);

-- Row Level Security
ALTER TABLE document_processing ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase2_readiness ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "document_processing_organization_access" ON document_processing
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "session_token_usage_organization_access" ON session_token_usage
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "api_calls_organization_access" ON api_calls
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "context_optimization_organization_access" ON context_optimization
    FOR ALL USING (session_id IN (
        SELECT id FROM chat_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "phase2_readiness_organization_access" ON phase2_readiness
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Triggers for updated_at timestamps
CREATE TRIGGER update_document_processing_updated_at BEFORE UPDATE ON document_processing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_token_usage_updated_at BEFORE UPDATE ON session_token_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phase2_readiness_updated_at BEFORE UPDATE ON phase2_readiness
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize token usage tracking for new sessions
CREATE OR REPLACE FUNCTION initialize_session_token_tracking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO session_token_usage (
        session_id,
        organization_id,
        user_id
    ) VALUES (
        NEW.id,
        NEW.organization_id,
        NEW.user_id
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create token tracking for new chat sessions
CREATE TRIGGER initialize_session_token_tracking_trigger 
    AFTER INSERT ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION initialize_session_token_tracking();