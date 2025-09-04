-- PrismForge AI - Initial Database Schema
-- Multi-tenant enterprise M&A validation platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table for enterprise multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('individual', 'team', 'enterprise')) DEFAULT 'individual',
    settings JSONB DEFAULT '{}',
    billing_settings JSONB DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}',
    domain_whitelist TEXT[],
    sso_configuration JSONB DEFAULT '{}',
    default_payment_method JSONB DEFAULT '{}',
    auto_approve_limit_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users with organization association and enterprise features
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'viewer')),
    
    -- Authentication providers
    auth_provider TEXT NOT NULL CHECK (auth_provider IN ('email', 'google', 'microsoft', 'saml')),
    auth_provider_id TEXT,
    encrypted_password TEXT, -- Only for email auth
    
    -- Enterprise user attributes
    full_name TEXT,
    job_title TEXT,
    department TEXT,
    cost_center TEXT,
    analysis_approval_limit_cents INTEGER DEFAULT 50000, -- $500 default
    
    -- Account status and tracking
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions for Phase 1 (FREE) with usage tracking
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT,
    document_metadata JSONB DEFAULT '[]',
    context_summary TEXT,
    
    -- Usage tracking (FREE Phase 1, no cost charged)
    token_usage INTEGER DEFAULT 0,
    cost_cents INTEGER DEFAULT 0, -- Always 0 for Phase 1
    phase TEXT NOT NULL DEFAULT '1' CHECK (phase IN ('1', '2')),
    
    -- Quality and transition tracking
    transition_readiness BOOLEAN DEFAULT FALSE,
    professional_quality_score DECIMAL(3,2),
    refined_objectives JSONB DEFAULT '{}',
    preliminary_insights JSONB DEFAULT '[]',
    recommended_validation_mode TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    token_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis sessions for Phase 2 with professional features
CREATE TABLE analysis_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Analysis configuration
    mode TEXT NOT NULL CHECK (mode IN ('2_agent')) DEFAULT '2_agent',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Pay-per-analysis pricing
    cost_cents INTEGER NOT NULL DEFAULT 50000, -- $500 per professional validation
    
    -- Results and quality
    results JSONB,
    professional_quality_score DECIMAL(3,2),
    
    -- Usage tracking
    token_usage INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    
    -- Enterprise features
    team_id UUID,
    shared_with_organization BOOLEAN DEFAULT FALSE,
    billing_status TEXT DEFAULT 'pending' CHECK (billing_status IN ('pending', 'approved', 'paid', 'failed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Agent execution tracking with professional metrics
CREATE TABLE agent_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL CHECK (agent_type IN ('skeptic', 'validator', 'synthesis')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    
    -- Progress and performance tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    current_task TEXT,
    findings JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2),
    
    -- Resource usage - standardized token allocation
    token_usage INTEGER DEFAULT 0,
    token_budget INTEGER DEFAULT 35000, -- Will be set to 10000 for synthesis in trigger
    
    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional quality tracking with internal standards
CREATE TABLE quality_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    
    -- Professional Quality Score metrics based on internal methodology
    internal_consistency_score DECIMAL(3,2),
    evidence_strength_score DECIMAL(3,2),
    recommendation_logic_score DECIMAL(3,2),
    overall_quality_score DECIMAL(3,2),
    
    -- Professional validation indicators (internal standards)
    methodology_applied BOOLEAN DEFAULT TRUE,
    quality_assurance_passed BOOLEAN DEFAULT TRUE,
    professional_standard_met BOOLEAN DEFAULT FALSE, -- TRUE when ≥0.85
    
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis billing records for pay-per-analysis model
CREATE TABLE analysis_billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Pay-per-analysis billing details
    amount_cents INTEGER NOT NULL DEFAULT 50000, -- $500 per professional validation
    currency TEXT NOT NULL DEFAULT 'USD',
    billing_date TIMESTAMPTZ DEFAULT NOW(),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    
    -- Enterprise attribution
    cost_center TEXT,
    department TEXT,
    project_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_billing_records ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS policies
CREATE POLICY "users_own_organization" ON organizations
    FOR ALL USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "users_same_organization" ON users
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "sessions_same_organization" ON chat_sessions
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "messages_same_organization" ON chat_messages
    FOR ALL USING (session_id IN (
        SELECT id FROM chat_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "analyses_same_organization" ON analysis_sessions
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "agents_same_organization" ON agent_executions
    FOR ALL USING (session_id IN (
        SELECT id FROM analysis_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "quality_same_organization" ON quality_assessments
    FOR ALL USING (analysis_session_id IN (
        SELECT id FROM analysis_sessions WHERE organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

CREATE POLICY "billing_records_organization_access" ON analysis_billing_records
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_org ON chat_sessions(organization_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_analysis_sessions_user ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_org ON analysis_sessions(organization_id);
CREATE INDEX idx_agent_executions_session ON agent_executions(session_id);
CREATE INDEX idx_quality_assessments_session ON quality_assessments(analysis_session_id);
CREATE INDEX idx_billing_records_org ON analysis_billing_records(organization_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_records_updated_at BEFORE UPDATE ON analysis_billing_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to set token budget based on agent type
CREATE OR REPLACE FUNCTION set_agent_token_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Set token budget based on agent type
    IF NEW.agent_type = 'synthesis' THEN
        NEW.token_budget = 10000;
    ELSE
        NEW.token_budget = 35000; -- For skeptic and validator agents
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to set token budget on insert
CREATE TRIGGER set_agent_token_budget_trigger BEFORE INSERT ON agent_executions
    FOR EACH ROW EXECUTE FUNCTION set_agent_token_budget();