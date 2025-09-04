-- Phase 2 Multi-Agent Validation System (MINIMAL SAFE CREATION)
-- PrismForge AI - Professional M&A Validation Platform
-- This migration creates only the essential tables first

-- Step 1: Create analysis_sessions table
CREATE TABLE IF NOT EXISTS analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    execution_id TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    validation_type TEXT NOT NULL DEFAULT 'professional_multi_agent',
    professional_value_cents INTEGER NOT NULL DEFAULT 50000,
    analysis_objectives JSONB NOT NULL DEFAULT '{}',
    optimized_context JSONB NOT NULL DEFAULT '{}',
    token_budget INTEGER NOT NULL DEFAULT 80000,
    professional_quality_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    total_processing_time_ms INTEGER,
    overall_recommendation TEXT,
    confidence_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2),
    professional_standard_met BOOLEAN DEFAULT FALSE,
    total_tokens_used INTEGER DEFAULT 0,
    tokens_remaining INTEGER,
    cost_breakdown JSONB DEFAULT '{}',
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create agent_executions table 
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL,
    execution_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    agent_role TEXT NOT NULL,
    execution_order INTEGER NOT NULL,
    token_budget INTEGER NOT NULL,
    professional_methodology BOOLEAN DEFAULT TRUE,
    quality_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.85,
    status TEXT NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_task TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    processing_time_ms INTEGER,
    findings JSONB DEFAULT '[]',
    risk_summary TEXT,
    confidence_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2),
    professional_standard_met BOOLEAN DEFAULT FALSE,
    tokens_allocated INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    tokens_remaining INTEGER,
    api_calls JSONB DEFAULT '[]',
    api_call_count INTEGER DEFAULT 0,
    context_for_next_agent JSONB DEFAULT '[]',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create remaining tables
CREATE TABLE IF NOT EXISTS quality_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL,
    agent_execution_id UUID,
    validation_type TEXT NOT NULL,
    professional_methodology_score DECIMAL(3,2),
    internal_consistency_score DECIMAL(3,2),
    evidence_quality_score DECIMAL(3,2),
    recommendation_logic_score DECIMAL(3,2),
    deliverable_quality_score DECIMAL(3,2),
    overall_quality_score DECIMAL(3,2),
    professional_quality_score DECIMAL(3,2),
    professional_standard_met BOOLEAN DEFAULT FALSE,
    board_ready_quality BOOLEAN DEFAULT FALSE,
    frameworks_assessed JSONB DEFAULT '[]',
    framework_consistency_scores JSONB DEFAULT '{}',
    value_delivery_score DECIMAL(3,2),
    professional_value_justified BOOLEAN DEFAULT FALSE,
    quality_metrics JSONB DEFAULT '{}',
    validation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_status_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id TEXT NOT NULL,
    agent_type TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    current_task TEXT NOT NULL,
    professional_context BOOLEAN DEFAULT TRUE,
    professional_quality_score DECIMAL(3,2),
    professional_standard_met BOOLEAN DEFAULT FALSE,
    value_message TEXT,
    findings JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    broadcasted BOOLEAN DEFAULT FALSE,
    broadcast_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS professional_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL,
    deliverable_type TEXT NOT NULL,
    professional_standard BOOLEAN DEFAULT TRUE,
    content JSONB NOT NULL DEFAULT '{}',
    formatted_content TEXT,
    professional_quality_score DECIMAL(3,2),
    word_count INTEGER,
    confidence_level DECIMAL(3,2),
    professional_value_cents INTEGER DEFAULT 50000,
    generated_by TEXT,
    generation_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add constraints after tables exist (safe approach)
DO $$
BEGIN
    -- Add CHECK constraints only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analysis_sessions_status_check') THEN
        ALTER TABLE analysis_sessions ADD CONSTRAINT analysis_sessions_status_check 
            CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analysis_sessions_validation_type_check') THEN
        ALTER TABLE analysis_sessions ADD CONSTRAINT analysis_sessions_validation_type_check 
            CHECK (validation_type IN ('professional_multi_agent'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_executions_status_check') THEN
        ALTER TABLE agent_executions ADD CONSTRAINT agent_executions_status_check 
            CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_executions_agent_type_check') THEN
        ALTER TABLE agent_executions ADD CONSTRAINT agent_executions_agent_type_check 
            CHECK (agent_type IN ('skeptic', 'validator', 'synthesis'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_executions_progress_check') THEN
        ALTER TABLE agent_executions ADD CONSTRAINT agent_executions_progress_check 
            CHECK (progress >= 0 AND progress <= 100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quality_validations_validation_type_check') THEN
        ALTER TABLE quality_validations ADD CONSTRAINT quality_validations_validation_type_check 
            CHECK (validation_type IN ('agent_output', 'final_synthesis', 'professional_standard'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_status_updates_agent_type_check') THEN
        ALTER TABLE agent_status_updates ADD CONSTRAINT agent_status_updates_agent_type_check 
            CHECK (agent_type IN ('skeptic', 'validator', 'synthesis', 'system'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'professional_deliverables_deliverable_type_check') THEN
        ALTER TABLE professional_deliverables ADD CONSTRAINT professional_deliverables_deliverable_type_check 
            CHECK (deliverable_type IN ('executive_summary', 'risk_analysis', 'strategic_assessment', 'final_recommendation', 'board_presentation'));
    END IF;

    -- Add unique constraint
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'analysis_sessions_execution_id_unique') THEN
        ALTER TABLE analysis_sessions ADD CONSTRAINT analysis_sessions_execution_id_unique UNIQUE (execution_id);
    END IF;
END $$;

-- Step 6: Basic indexes
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_execution_id ON analysis_sessions(execution_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_executions_analysis_session ON agent_executions(analysis_session_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_execution_id ON agent_executions(execution_id);