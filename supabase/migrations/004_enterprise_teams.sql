-- Enterprise Teams and Collaboration Schema
-- Building on Prompt 1 foundation for enterprise multi-tenancy

-- Teams table for enterprise team collaboration
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    team_lead_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Team settings and budget controls
    default_permissions JSONB DEFAULT '[]',
    team_budget_limit_cents INTEGER, -- Optional budget limit for team analyses ($500 per analysis)
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team memberships for collaboration
CREATE TABLE team_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- Analysis sharing for team collaboration
CREATE TABLE analysis_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{}', -- { canEdit, canShare, canExport, canComment }
    shared_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table for enterprise session management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    sso_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for cost attribution (pay-per-analysis model)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    
    -- Cost attribution fields
    cost_cents INTEGER NOT NULL DEFAULT 50000, -- $500 per professional validation
    cost_center TEXT,
    department TEXT,
    billing_model TEXT NOT NULL DEFAULT 'pay_per_analysis',
    analysis_value_cents INTEGER NOT NULL DEFAULT 50000,
    
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for enterprise compliance
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add team context to existing analysis_sessions table
ALTER TABLE analysis_sessions ADD COLUMN IF NOT EXISTS
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    payment_transaction_id TEXT;

-- Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS policies for teams
CREATE POLICY "team_organization_access" ON teams
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "team_membership_access" ON team_memberships
    FOR ALL USING (team_id IN (
        SELECT id FROM teams WHERE organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    ));

CREATE POLICY "analysis_share_access" ON analysis_shares
    FOR ALL USING (
        shared_by = auth.uid() OR
        team_id IN (
            SELECT team_id FROM team_memberships WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "user_session_access" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "usage_record_access" ON usage_records
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "audit_log_access" ON audit_logs
    FOR SELECT USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Update existing analysis_sessions policy for team sharing
DROP POLICY IF EXISTS "analyses_same_organization" ON analysis_sessions;
CREATE POLICY "analysis_session_access" ON analysis_sessions
    FOR ALL USING (
        user_id = auth.uid() OR
        shared_with_organization = TRUE OR
        team_id IN (
            SELECT team_id FROM team_memberships WHERE user_id = auth.uid()
        ) OR
        id IN (
            SELECT analysis_id FROM analysis_shares 
            WHERE team_id IN (
                SELECT team_id FROM team_memberships WHERE user_id = auth.uid()
            )
        )
    );

-- Indexes for performance
CREATE INDEX idx_teams_organization ON teams(organization_id);
CREATE INDEX idx_teams_lead ON teams(team_lead_id);
CREATE INDEX idx_team_memberships_team ON team_memberships(team_id);
CREATE INDEX idx_team_memberships_user ON team_memberships(user_id);
CREATE INDEX idx_analysis_shares_analysis ON analysis_shares(analysis_id);
CREATE INDEX idx_analysis_shares_team ON analysis_shares(team_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_usage_records_org ON usage_records(organization_id);
CREATE INDEX idx_usage_records_user ON usage_records(user_id);
CREATE INDEX idx_usage_records_analysis ON usage_records(analysis_id);
CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_organization_id UUID,
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_organization_id,
        p_user_id,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        p_ip_address,
        p_user_agent
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;