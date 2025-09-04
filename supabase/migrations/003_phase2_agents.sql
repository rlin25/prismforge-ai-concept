-- Phase 2 Multi-Agent Validation System
-- PrismForge AI - Professional M&A Validation Platform

-- Analysis sessions for Phase 2 ($500 professional validations)
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session identification
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    execution_id TEXT NOT NULL UNIQUE, -- For real-time tracking
    
    -- Professional validation details
    validation_type TEXT NOT NULL DEFAULT 'professional_multi_agent' CHECK (validation_type IN ('professional_multi_agent')),
    professional_value_cents INTEGER NOT NULL DEFAULT 50000, -- $500 per professional validation
    
    -- Analysis configuration
    analysis_objectives JSONB NOT NULL DEFAULT '{}',
    optimized_context JSONB NOT NULL DEFAULT '{}',
    token_budget INTEGER NOT NULL DEFAULT 80000, -- 80K total budget
    professional_quality_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.85, -- ≥85% professional standard
    
    -- Execution status
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_processing_time_ms INTEGER,
    
    -- Results and quality metrics
    overall_recommendation TEXT,
    confidence_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2), -- Professional Quality Score ≥85%
    professional_standard_met BOOLEAN DEFAULT FALSE,
    
    -- Token usage tracking
    total_tokens_used INTEGER DEFAULT 0,
    tokens_remaining INTEGER,
    cost_breakdown JSONB DEFAULT '{}',
    
    -- Enterprise context
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent execution tracking (Skeptic + Validator + Synthesis)
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session reference
    analysis_session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    execution_id TEXT NOT NULL, -- Same as analysis_sessions.execution_id
    
    -- Agent details
    agent_type TEXT NOT NULL CHECK (agent_type IN ('skeptic', 'validator', 'synthesis')),
    agent_role TEXT NOT NULL,
    execution_order INTEGER NOT NULL,
    
    -- Professional configuration
    token_budget INTEGER NOT NULL,
    professional_methodology BOOLEAN DEFAULT TRUE,
    quality_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.85, -- ≥85% professional standard
    
    -- Execution status
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_task TEXT,
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    
    -- Results
    findings JSONB DEFAULT '[]',
    risk_summary TEXT,
    confidence_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2), -- Professional Quality Score validation
    professional_standard_met BOOLEAN DEFAULT FALSE,
    
    -- Token usage
    tokens_allocated INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    tokens_remaining INTEGER,
    
    -- API tracking
    api_calls JSONB DEFAULT '[]',
    api_call_count INTEGER DEFAULT 0,
    
    -- Context for next agent
    context_for_next_agent JSONB DEFAULT '[]',
    
    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional Quality Score validation tracking
CREATE TABLE IF NOT EXISTS quality_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session reference
    analysis_session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    agent_execution_id UUID REFERENCES agent_executions(id) ON DELETE CASCADE,
    
    -- Quality assessment
    validation_type TEXT NOT NULL CHECK (validation_type IN ('agent_output', 'final_synthesis', 'professional_standard')),
    professional_methodology_score DECIMAL(3,2),
    internal_consistency_score DECIMAL(3,2),
    evidence_quality_score DECIMAL(3,2),
    recommendation_logic_score DECIMAL(3,2),
    deliverable_quality_score DECIMAL(3,2),
    
    -- Professional Quality Score aggregation
    overall_quality_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2), -- Final Professional Quality Score
    professional_standard_met BOOLEAN DEFAULT FALSE, -- TRUE when ≥85%
    board_ready_quality BOOLEAN DEFAULT FALSE,
    
    -- Quality frameworks used
    frameworks_assessed JSONB DEFAULT '[]',
    framework_consistency_scores JSONB DEFAULT '{}',
    
    -- Value delivery assessment
    value_delivery_score DECIMAL(3,2),
    professional_value_justified BOOLEAN DEFAULT FALSE,
    
    -- Quality details
    quality_metrics JSONB DEFAULT '{}',
    validation_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time status updates for SSE broadcasting
CREATE TABLE IF NOT EXISTS agent_status_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session and agent reference
    execution_id TEXT NOT NULL,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('skeptic', 'validator', 'synthesis', 'system')),
    
    -- Status details
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    current_task TEXT NOT NULL,
    professional_context BOOLEAN DEFAULT TRUE,
    
    -- Professional messaging
    professional_quality_score DECIMAL(3,2),
    professional_standard_met BOOLEAN DEFAULT FALSE,
    value_message TEXT, -- E.g., "$500 professional validation in progress"
    
    -- Update metadata
    findings JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    
    -- Broadcasting
    broadcasted BOOLEAN DEFAULT FALSE,
    broadcast_timestamp TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional deliverables tracking
CREATE TABLE IF NOT EXISTS professional_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session reference
    analysis_session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    
    -- Deliverable details
    deliverable_type TEXT NOT NULL CHECK (deliverable_type IN ('executive_summary', 'risk_analysis', 'strategic_assessment', 'final_recommendation', 'board_presentation')),
    professional_standard BOOLEAN DEFAULT TRUE,
    
    -- Content
    content JSONB NOT NULL DEFAULT '{}',
    formatted_content TEXT,
    professional_quality_score DECIMAL(3,2),
    
    -- Metadata
    word_count INTEGER,
    confidence_level DECIMAL(3,2),
    professional_value_cents INTEGER DEFAULT 50000, -- $500 value per professional validation
    
    -- Generation details
    generated_by TEXT, -- 'skeptic_agent', 'validator_agent', 'synthesis_agent'
    generation_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_execution_id ON analysis_sessions(execution_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_org ON analysis_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_started_at ON analysis_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_agent_executions_analysis_session ON agent_executions(analysis_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_execution_id ON agent_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_agent_type ON agent_executions(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_executions_status ON agent_executions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_order ON agent_executions(execution_order);

CREATE INDEX IF NOT EXISTS idx_quality_validations_session ON quality_validations(analysis_session_id);
CREATE INDEX IF NOT EXISTS idx_quality_validations_agent ON quality_validations(agent_execution_id);
CREATE INDEX IF NOT EXISTS idx_quality_validations_score ON quality_validations(professional_quality_score);

CREATE INDEX IF NOT EXISTS idx_agent_status_updates_execution ON agent_status_updates(execution_id);
CREATE INDEX IF NOT EXISTS idx_agent_status_updates_created ON agent_status_updates(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_status_updates_broadcast ON agent_status_updates(broadcasted);

CREATE INDEX IF NOT EXISTS idx_professional_deliverables_session ON professional_deliverables(analysis_session_id);
CREATE INDEX IF NOT EXISTS idx_professional_deliverables_type ON professional_deliverables(deliverable_type);

-- Row Level Security
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_deliverables ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "analysis_sessions_organization_access" ON analysis_sessions
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "agent_executions_organization_access" ON agent_executions
    FOR ALL USING (analysis_session_id IN (
        SELECT id FROM analysis_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "quality_validations_organization_access" ON quality_validations
    FOR ALL USING (analysis_session_id IN (
        SELECT id FROM analysis_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "agent_status_updates_public_read" ON agent_status_updates
    FOR SELECT USING (TRUE); -- Public read for real-time updates

CREATE POLICY "professional_deliverables_organization_access" ON professional_deliverables
    FOR ALL USING (analysis_session_id IN (
        SELECT id FROM analysis_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- Triggers for updated_at timestamps
CREATE TRIGGER update_analysis_sessions_updated_at BEFORE UPDATE ON analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_executions_updated_at BEFORE UPDATE ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize agent executions for new analysis sessions
CREATE OR REPLACE FUNCTION initialize_agent_executions()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert Skeptic Agent execution
    INSERT INTO agent_executions (
        analysis_session_id,
        execution_id,
        agent_type,
        agent_role,
        execution_order,
        token_budget,
        tokens_allocated,
        tokens_remaining,
        professional_methodology,
        quality_threshold
    ) VALUES (
        NEW.id,
        NEW.execution_id,
        'skeptic',
        'risk_identification_assumption_questioning',
        1,
        35000,
        35000,
        35000,
        TRUE,
        0.85
    );
    
    -- Insert Validator Agent execution
    INSERT INTO agent_executions (
        analysis_session_id,
        execution_id,
        agent_type,
        agent_role,
        execution_order,
        token_budget,
        tokens_allocated,
        tokens_remaining,
        professional_methodology,
        quality_threshold
    ) VALUES (
        NEW.id,
        NEW.execution_id,
        'validator',
        'strategic_assessment_opportunity_validation',
        2,
        35000,
        35000,
        35000,
        TRUE,
        0.85
    );
    
    -- Insert Synthesis execution
    INSERT INTO agent_executions (
        analysis_session_id,
        execution_id,
        agent_type,
        agent_role,
        execution_order,
        token_budget,
        tokens_allocated,
        tokens_remaining,
        professional_methodology,
        quality_threshold
    ) VALUES (
        NEW.id,
        NEW.execution_id,
        'synthesis',
        'final_synthesis_confidence_scoring',
        3,
        10000,
        10000,
        10000,
        TRUE,
        0.85
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create agent executions for new analysis sessions
CREATE TRIGGER initialize_agent_executions_trigger 
    AFTER INSERT ON analysis_sessions
    FOR EACH ROW EXECUTE FUNCTION initialize_agent_executions();

-- Function to update tokens remaining
CREATE OR REPLACE FUNCTION update_tokens_remaining()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tokens_remaining = NEW.tokens_allocated - NEW.tokens_used;
    
    -- Update analysis session totals
    UPDATE analysis_sessions 
    SET total_tokens_used = (
        SELECT SUM(tokens_used) FROM agent_executions 
        WHERE analysis_session_id = NEW.analysis_session_id
    ),
    tokens_remaining = (
        SELECT token_budget - SUM(tokens_used) FROM agent_executions 
        WHERE analysis_session_id = NEW.analysis_session_id
        GROUP BY analysis_session_id
        LIMIT 1
    )
    WHERE id = NEW.analysis_session_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update token calculations
CREATE TRIGGER update_tokens_remaining_trigger BEFORE UPDATE ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION update_tokens_remaining();