# PrismForge AI Enterprise API Documentation

## Overview

The PrismForge AI Enterprise API provides comprehensive endpoints for managing multi-tenant organizations, teams, users, and billing in a professional M&A validation platform. All endpoints require authentication via JWT tokens and enforce role-based access control.

**Base URL:** `https://your-domain.com/api`  
**Authentication:** Bearer JWT tokens  
**Rate Limiting:** 100 requests/minute per user  
**Response Format:** JSON

## Authentication

### SSO Authentication Endpoints

#### Google OAuth Flow

**Initiate Google OAuth**
```http
GET /api/auth/google?org_hint={organization_id}&state={random_state}
```

Parameters:
- `org_hint` (optional): Organization ID to associate user with
- `state` (required): Random state parameter for CSRF protection

Response: Redirects to Google OAuth consent screen

**Google OAuth Callback**
```http
GET /api/auth/google/callback?code={auth_code}&state={state}
```

Handles the OAuth callback and provisions user account.

Returns:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "organization_id": "uuid",
    "role": "analyst"
  },
  "session": {
    "token": "jwt_token",
    "expires_in": 28800
  },
  "redirect_url": "/dashboard"
}
```

#### Microsoft SSO Flow

**Initiate Microsoft SSO**
```http
GET /api/auth/microsoft?org_hint={organization_id}&state={random_state}
```

**Microsoft SSO Callback**
```http
GET /api/auth/microsoft/callback?code={auth_code}&state={state}
```

Similar structure to Google OAuth with Microsoft Azure AD integration.

### Session Management

**Validate Session**
```http
POST /api/auth/validate
Authorization: Bearer {jwt_token}
```

Returns:
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "organization_id": "uuid",
    "role": "analyst",
    "permissions": ["analyses.create", "analyses.view_own"]
  }
}
```

## Enterprise Management

### Organizations

**Get Organization Details**
```http
GET /api/enterprise/organization
Authorization: Bearer {jwt_token}
```

Returns organization configuration, billing settings, and security policies.

**Update Organization Settings**
```http
PUT /api/enterprise/organization
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "sso_configuration": {
    "google": { "enabled": true, "domain": "company.com" },
    "microsoft": { "enabled": true, "tenant_id": "tenant-uuid" },
    "saml": { "enabled": false }
  },
  "security_settings": {
    "session_timeout_hours": 8,
    "mfa_required": true,
    "ip_whitelist": ["192.168.1.0/24"]
  },
  "billing_settings": {
    "auto_approve_limit_cents": 250000,
    "payment_method": "enterprise_billing"
  }
}
```

### Team Management

**List Organization Teams**
```http
GET /api/enterprise/teams
Authorization: Bearer {jwt_token}
```

Returns:
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "M&A Analysis Team",
      "description": "Primary deal analysis team",
      "team_lead_id": "uuid",
      "member_count": 8,
      "budget_limit_cents": 500000,
      "monthly_usage_cents": 150000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Create New Team**
```http
POST /api/enterprise/teams
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "name": "Corporate Development Team",
  "description": "Internal M&A evaluation team",
  "team_budget_limit_cents": 250000,
  "default_permissions": ["analyses.create", "analyses.share"]
}
```

**Add Team Members**
```http
POST /api/enterprise/teams/{team_id}/members
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "user_ids": ["uuid1", "uuid2"],
  "role": "member"
}
```

### User Management

**List Organization Users**
```http
GET /api/enterprise/users?page=1&limit=50&role=analyst
Authorization: Bearer {jwt_token}
```

Returns:
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "analyst@company.com",
      "full_name": "Jane Smith",
      "role": "analyst",
      "department": "Corporate Development",
      "cost_center": "CC-001",
      "analysis_approval_limit_cents": 50000,
      "last_login": "2024-01-20T14:30:00Z",
      "monthly_usage_cents": 15000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "total_pages": 3
  }
}
```

**Update User Role**
```http
PUT /api/enterprise/users/{user_id}/role
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "role": "manager",
  "department": "M&A Advisory",
  "cost_center": "CC-002"
}
```

## Usage Tracking & Billing

### Usage Reports

**Generate Usage Report**
```http
GET /api/enterprise/usage?period=monthly&year=2024&month=1
Authorization: Bearer {jwt_token}
```

Returns:
```json
{
  "report": {
    "organization_id": "uuid",
    "period": "2024-01",
    "summary": {
      "total_analyses": 42,
      "total_cost_cents": 2100000,
      "cost_per_analysis_cents": 50000,
      "active_users": 18,
      "cost_savings_vs_traditional_cents": 189000000
    },
    "breakdown": {
      "by_department": [
        {
          "department": "Corporate Development",
          "analyses_count": 25,
          "total_cost_cents": 1250000,
          "user_count": 8
        }
      ],
      "by_cost_center": [
        {
          "cost_center": "CC-001",
          "analyses_count": 15,
          "total_cost_cents": 750000,
          "user_count": 5
        }
      ],
      "monthly_trend": [
        {
          "month": "2024-01",
          "analyses_count": 42,
          "total_cost_cents": 2100000
        }
      ]
    }
  }
}
```

**Get Real-time Usage Metrics**
```http
GET /api/enterprise/metrics
Authorization: Bearer {jwt_token}
```

Returns current month metrics, active sessions, and billing status.

### Billing Records

**List Billing Records**
```http
GET /api/enterprise/billing?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {jwt_token}
```

**Create Manual Billing Entry**
```http
POST /api/enterprise/billing
Authorization: Bearer {jwt_token}
```

## Analysis Management

### Professional Validation

**Initiate Professional Analysis**
```http
POST /api/phase2/validate
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "document_content": "M&A analysis data...",
  "analysis_type": "financial_due_diligence",
  "cost_center": "CC-001",
  "department": "Corporate Development",
  "team_id": "uuid",
  "requires_approval": true
}
```

**Approve Analysis**
```http
POST /api/phase2/validate/{analysis_id}/approve
Authorization: Bearer {jwt_token}
```

Required permissions: `analyses.approve` or sufficient approval limit.

### Analysis Sharing

**Share Analysis with Team**
```http
POST /api/enterprise/analysis/{analysis_id}/share
Authorization: Bearer {jwt_token}
```

Request body:
```json
{
  "team_id": "uuid",
  "permissions": {
    "can_edit": false,
    "can_share": false,
    "can_export": true,
    "can_comment": true
  }
}
```

## Admin Endpoints

### Activity Monitoring

**Get Recent Activity**
```http
GET /api/admin/activity?limit=50&type=sso_login
Authorization: Bearer {jwt_token}
```

Returns:
```json
{
  "activities": [
    {
      "id": "uuid",
      "action": "sso_login",
      "user": "john.doe@company.com",
      "timestamp": "2024-01-20T15:45:00Z",
      "resource_type": "user",
      "details": {
        "provider": "google",
        "ip": "192.168.1.100"
      }
    }
  ]
}
```

**Get System Metrics**
```http
GET /api/admin/metrics
Authorization: Bearer {jwt_token}
```

### Audit Logs

**Query Audit Logs**
```http
GET /api/admin/audit?start_date=2024-01-01&user_id=uuid&action=role_assigned
Authorization: Bearer {jwt_token}
```

Returns comprehensive audit trail for compliance.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "PERMISSION_DENIED",
  "details": {
    "required_permission": "users.manage",
    "user_role": "analyst"
  },
  "timestamp": "2024-01-20T15:45:00Z"
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` (401): Missing or invalid JWT token
- `PERMISSION_DENIED` (403): User lacks required permissions
- `RESOURCE_NOT_FOUND` (404): Requested resource doesn't exist
- `VALIDATION_ERROR` (422): Invalid request parameters
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server-side error

## Role-Based Access Control

### Permission Matrix

| Role | Analyses | Users | Teams | Billing | Settings |
|------|----------|--------|--------|---------|----------|
| **Owner** | All | Manage | Manage | Full | Full |
| **Admin** | All | Manage | Manage | View | Limited |
| **Manager** | Team + Own | View Team | Manage Own | View Team | None |
| **Analyst** | Own + Shared | None | View | None | None |
| **Viewer** | Shared Only | None | View | None | None |

### Approval Limits

- **Owner**: Unlimited ($0 = no limit)
- **Admin**: $2,500 worth of analyses
- **Manager**: $1,000 worth of analyses  
- **Analyst**: $500 (one professional validation)
- **Viewer**: $0 (cannot initiate analyses)

## SDK and Integration Examples

### JavaScript/TypeScript SDK

```typescript
import { PrismForgeClient } from '@prismforge/sdk';

const client = new PrismForgeClient({
  apiUrl: 'https://api.prismforge.ai',
  token: 'your-jwt-token'
});

// Create analysis
const analysis = await client.analyses.create({
  documentContent: 'M&A data...',
  analysisType: 'financial_due_diligence',
  costCenter: 'CC-001'
});

// Generate usage report
const report = await client.usage.generateReport({
  period: 'monthly',
  year: 2024,
  month: 1
});
```

### Webhook Integration

Register webhooks to receive real-time notifications:

```json
{
  "events": ["analysis.completed", "user.created", "billing.processed"],
  "url": "https://your-app.com/webhooks/prismforge",
  "secret": "webhook-secret-key"
}
```

## Rate Limits and Quotas

- **Standard Users**: 100 requests/minute
- **Enterprise Users**: 1000 requests/minute  
- **Bulk Operations**: 10 requests/minute
- **Report Generation**: 5 requests/hour

## Support

- **Technical Documentation**: https://docs.prismforge.ai
- **API Status Page**: https://status.prismforge.ai
- **Enterprise Support**: enterprise-support@prismforge.ai
- **Developer Forum**: https://forum.prismforge.ai

---

*Last updated: 2024-01-20*  
*API Version: v1.0*  
*OpenAPI Specification: Available at `/api/openapi.json`*