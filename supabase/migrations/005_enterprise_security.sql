-- Enterprise Security Enhancement Schema
-- PrismForge AI - Additional Security Tables for Compliance and Monitoring

-- Security Events table for comprehensive security monitoring
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'authentication_failure',
        'suspicious_login',
        'rate_limit_exceeded',
        'unauthorized_access_attempt',
        'data_export_unusual',
        'privilege_escalation',
        'suspicious_device',
        'geo_anomaly',
        'mfa_bypass_attempt',
        'session_hijacking',
        'injection_attempt',
        'compliance_violation',
        'data_breach_attempt',
        'admin_action_unusual'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    source TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    location JSONB,
    risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    mitigation_actions TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')) DEFAULT 'open',
    metadata JSONB DEFAULT '{}',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Alerts table for threshold-based alerting
CREATE TABLE security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_exceeded', 'anomaly_detected', 'compliance_violation', 'security_incident')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_users UUID[] DEFAULT '{}',
    affected_resources TEXT[] DEFAULT '{}',
    trigger_conditions JSONB DEFAULT '{}',
    recommended_actions TEXT[] DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('active', 'acknowledged', 'resolved', 'suppressed')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Device Fingerprints table for device trust management
CREATE TABLE device_fingerprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fingerprint TEXT NOT NULL,
    device_info JSONB NOT NULL DEFAULT '{}',
    trust_level TEXT NOT NULL CHECK (trust_level IN ('trusted', 'unknown', 'suspicious', 'blocked')) DEFAULT 'unknown',
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending', 'failed')) DEFAULT 'pending',
    risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, fingerprint)
);

-- MFA Configurations table for multi-factor authentication
CREATE TABLE mfa_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL CHECK (method_type IN ('totp', 'sms', 'email', 'hardware', 'biometric')),
    secret_encrypted TEXT NOT NULL,
    backup_codes_encrypted TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending_verification', 'active', 'disabled', 'suspended')) DEFAULT 'pending_verification',
    verified_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    disabled_at TIMESTAMPTZ,
    disabled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(user_id, method_type, status) DEFERRABLE INITIALLY DEFERRED
);

-- MFA Grace Periods table for new user onboarding
CREATE TABLE mfa_grace_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Compliance Reports table for regulatory compliance tracking
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('soc2', 'gdpr', 'sox', 'ffiec', 'security_assessment')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'approved', 'submitted')) DEFAULT 'draft',
    findings JSONB DEFAULT '[]',
    recommendations TEXT[] DEFAULT '{}',
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    generated_by TEXT NOT NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Compliance Findings table for detailed compliance issues
CREATE TABLE compliance_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted_risk')) DEFAULT 'open',
    evidence JSONB DEFAULT '[]',
    remediation TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Encryption Keys table for key management
CREATE TABLE encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    algorithm TEXT NOT NULL DEFAULT 'aes-256-gcm',
    status TEXT NOT NULL CHECK (status IN ('active', 'rotated', 'revoked')) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    rotated_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(key_id, organization_id, version)
);

-- Encryption Operations table for audit trail
CREATE TABLE encryption_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    operation TEXT NOT NULL CHECK (operation IN ('encrypt', 'decrypt', 'key_rotate')),
    data_type TEXT,
    classification TEXT CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
    algorithm TEXT,
    key_id TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Threat Intelligence table for known threats
CREATE TABLE threat_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('ip_address', 'domain', 'user_agent', 'device_fingerprint', 'email')),
    value TEXT NOT NULL,
    threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    category TEXT NOT NULL,
    description TEXT,
    source TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'false_positive')) DEFAULT 'active',
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    confidence_score INTEGER DEFAULT 50 CHECK (confidence_score >= 0 AND confidence_score <= 100),
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(type, value)
);

-- Zero Trust Policies table for adaptive access control
CREATE TABLE zero_trust_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    conditions JSONB NOT NULL DEFAULT '[]',
    actions JSONB NOT NULL DEFAULT '[]',
    priority INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_evaluated_at TIMESTAMPTZ,
    evaluation_count INTEGER DEFAULT 0
);

-- Risk Assessments table for continuous risk evaluation
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_factors JSONB NOT NULL DEFAULT '[]',
    recommendation TEXT NOT NULL CHECK (recommendation IN ('allow', 'challenge', 'block')),
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    acted_upon BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Update organizations table to add security settings
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX idx_security_events_org_type ON security_events(organization_id, event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity, detected_at);
CREATE INDEX idx_security_events_status ON security_events(status, detected_at);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);
CREATE INDEX idx_security_events_user ON security_events(user_id, detected_at);

CREATE INDEX idx_security_alerts_org ON security_alerts(organization_id, status);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity, created_at);

CREATE INDEX idx_device_fingerprints_user ON device_fingerprints(user_id);
CREATE INDEX idx_device_fingerprints_fingerprint ON device_fingerprints(fingerprint);
CREATE INDEX idx_device_fingerprints_trust ON device_fingerprints(trust_level, last_seen);

CREATE INDEX idx_mfa_configs_user ON mfa_configs(user_id, status);
CREATE INDEX idx_mfa_configs_org ON mfa_configs(organization_id, method_type);

CREATE INDEX idx_compliance_reports_org ON compliance_reports(organization_id, report_type);
CREATE INDEX idx_compliance_reports_period ON compliance_reports(period_start, period_end);

CREATE INDEX idx_compliance_findings_org ON compliance_findings(organization_id, status);
CREATE INDEX idx_compliance_findings_severity ON compliance_findings(severity, due_date);

CREATE INDEX idx_encryption_keys_org ON encryption_keys(organization_id, status);
CREATE INDEX idx_encryption_keys_key_id ON encryption_keys(key_id, version);

CREATE INDEX idx_encryption_operations_org ON encryption_operations(organization_id, created_at);
CREATE INDEX idx_encryption_operations_user ON encryption_operations(user_id, operation);

CREATE INDEX idx_threat_intelligence_type_value ON threat_intelligence(type, value);
CREATE INDEX idx_threat_intelligence_status ON threat_intelligence(status, threat_level);

CREATE INDEX idx_zero_trust_policies_org ON zero_trust_policies(organization_id, enabled);
CREATE INDEX idx_zero_trust_policies_priority ON zero_trust_policies(priority, enabled);

CREATE INDEX idx_risk_assessments_user ON risk_assessments(user_id, calculated_at);
CREATE INDEX idx_risk_assessments_session ON risk_assessments(session_id, valid_until);

-- Row Level Security
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_grace_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE zero_trust_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multi-tenant security
CREATE POLICY "security_events_organization_access" ON security_events
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "security_alerts_organization_access" ON security_alerts
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "device_fingerprints_user_access" ON device_fingerprints
    FOR ALL USING (
        user_id = auth.uid() OR 
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "mfa_configs_user_access" ON mfa_configs
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "mfa_grace_periods_org_access" ON mfa_grace_periods
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "compliance_reports_org_access" ON compliance_reports
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "compliance_findings_org_access" ON compliance_findings
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "encryption_keys_org_access" ON encryption_keys
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "encryption_operations_org_access" ON encryption_operations
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "threat_intelligence_read_only" ON threat_intelligence
    FOR SELECT USING (true);

CREATE POLICY "zero_trust_policies_org_access" ON zero_trust_policies
    FOR ALL USING (organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "risk_assessments_user_org_access" ON risk_assessments
    FOR ALL USING (
        user_id = auth.uid() OR
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Triggers for updated_at timestamps
CREATE TRIGGER update_security_events_updated_at BEFORE UPDATE ON security_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_fingerprints_updated_at BEFORE UPDATE ON device_fingerprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mfa_configs_updated_at BEFORE UPDATE ON mfa_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_findings_updated_at BEFORE UPDATE ON compliance_findings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zero_trust_policies_updated_at BEFORE UPDATE ON zero_trust_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threat_intelligence_updated_at BEFORE UPDATE ON threat_intelligence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update device last_seen
CREATE OR REPLACE FUNCTION update_device_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_seen = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_device_last_seen_trigger BEFORE UPDATE ON device_fingerprints
    FOR EACH ROW EXECUTE FUNCTION update_device_last_seen();

-- Function to automatically expire old security events
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
    -- Archive security events older than 2 years
    UPDATE security_events 
    SET status = 'resolved'
    WHERE created_at < NOW() - INTERVAL '2 years' 
    AND status = 'open';
    
    -- Delete very old events (5+ years) for storage management
    DELETE FROM security_events 
    WHERE created_at < NOW() - INTERVAL '5 years';
END;
$$ language 'plpgsql';

-- Function to calculate risk score based on security events
CREATE OR REPLACE FUNCTION calculate_user_risk_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    risk_score INTEGER := 0;
    recent_events INTEGER;
    failed_attempts INTEGER;
    suspicious_devices INTEGER;
BEGIN
    -- Count recent security events (last 30 days)
    SELECT COUNT(*) INTO recent_events
    FROM security_events 
    WHERE user_id = p_user_id 
    AND detected_at > NOW() - INTERVAL '30 days'
    AND severity IN ('high', 'critical');
    
    -- Count failed authentication attempts (last 24 hours)
    SELECT COUNT(*) INTO failed_attempts
    FROM security_events 
    WHERE user_id = p_user_id 
    AND event_type = 'authentication_failure'
    AND detected_at > NOW() - INTERVAL '24 hours';
    
    -- Count suspicious devices
    SELECT COUNT(*) INTO suspicious_devices
    FROM device_fingerprints 
    WHERE user_id = p_user_id 
    AND trust_level IN ('suspicious', 'blocked');
    
    -- Calculate risk score
    risk_score := risk_score + (recent_events * 20);
    risk_score := risk_score + (failed_attempts * 10);
    risk_score := risk_score + (suspicious_devices * 15);
    
    -- Cap at 100
    risk_score := LEAST(100, risk_score);
    
    RETURN risk_score;
END;
$$ language 'plpgsql';

-- Create materialized view for security dashboard
CREATE MATERIALIZED VIEW security_dashboard_metrics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT se.id) FILTER (WHERE se.detected_at > NOW() - INTERVAL '24 hours') as events_24h,
    COUNT(DISTINCT se.id) FILTER (WHERE se.detected_at > NOW() - INTERVAL '7 days') as events_7d,
    COUNT(DISTINCT se.id) FILTER (WHERE se.severity = 'critical' AND se.detected_at > NOW() - INTERVAL '30 days') as critical_events_30d,
    COUNT(DISTINCT sa.id) FILTER (WHERE sa.status = 'active') as active_alerts,
    COUNT(DISTINCT df.id) FILTER (WHERE df.trust_level = 'trusted') as trusted_devices,
    COUNT(DISTINCT df.id) FILTER (WHERE df.trust_level IN ('suspicious', 'blocked')) as risky_devices,
    COUNT(DISTINCT mfa.id) FILTER (WHERE mfa.status = 'active') as mfa_enabled_users,
    COUNT(DISTINCT cf.id) FILTER (WHERE cf.status = 'open' AND cf.severity IN ('high', 'critical')) as open_critical_findings,
    NOW() as last_updated
FROM organizations o
LEFT JOIN security_events se ON o.id = se.organization_id
LEFT JOIN security_alerts sa ON o.id = sa.organization_id
LEFT JOIN device_fingerprints df ON o.id = df.organization_id
LEFT JOIN mfa_configs mfa ON o.id = mfa.organization_id
LEFT JOIN compliance_findings cf ON o.id = cf.organization_id
GROUP BY o.id, o.name;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_security_dashboard_org ON security_dashboard_metrics(organization_id);

-- Schedule regular refresh of materialized view (would be done via cron or scheduler)
COMMENT ON MATERIALIZED VIEW security_dashboard_metrics IS 'Security metrics dashboard - refresh every 15 minutes via scheduler';

-- Insert initial threat intelligence data
INSERT INTO threat_intelligence (type, value, threat_level, category, description, source, confidence_score) VALUES
('user_agent', 'curl/7.', 'medium', 'automation', 'Command line tool often used by bots', 'internal', 70),
('user_agent', 'wget/', 'medium', 'automation', 'Command line download tool', 'internal', 70),
('user_agent', 'python-requests/', 'low', 'automation', 'Python HTTP library', 'internal', 50),
('user_agent', 'bot', 'high', 'automation', 'Generic bot identifier', 'internal', 80),
('user_agent', 'crawler', 'medium', 'automation', 'Web crawler identifier', 'internal', 60),
('ip_address', '0.0.0.0', 'critical', 'invalid', 'Invalid IP address', 'internal', 100);

-- Grant necessary permissions for functions
GRANT EXECUTE ON FUNCTION cleanup_old_security_events() TO service_role;
GRANT EXECUTE ON FUNCTION calculate_user_risk_score(UUID) TO service_role;

-- Comments for documentation
COMMENT ON TABLE security_events IS 'Comprehensive security event logging for monitoring and compliance';
COMMENT ON TABLE security_alerts IS 'Threshold-based security alerting system';
COMMENT ON TABLE device_fingerprints IS 'Device trust management and fingerprinting';
COMMENT ON TABLE mfa_configs IS 'Multi-factor authentication configuration per user';
COMMENT ON TABLE compliance_reports IS 'Regulatory compliance reporting (SOC2, GDPR, SOX, FFIEC)';
COMMENT ON TABLE encryption_keys IS 'Encryption key management and rotation tracking';
COMMENT ON TABLE threat_intelligence IS 'Known threat indicators and reputation data';
COMMENT ON TABLE zero_trust_policies IS 'Adaptive access control policies based on risk';
COMMENT ON TABLE risk_assessments IS 'Continuous risk scoring for users and sessions';