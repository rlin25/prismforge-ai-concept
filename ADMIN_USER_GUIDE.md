# PrismForge AI Enterprise - Administrator User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Organization Management](#organization-management)
3. [User Management](#user-management)
4. [Team Management](#team-management)
5. [SSO Configuration](#sso-configuration)
6. [Usage Monitoring](#usage-monitoring)
7. [Billing Management](#billing-management)
8. [Security Administration](#security-administration)
9. [Audit and Compliance](#audit-and-compliance)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Administrator Dashboard Overview

The PrismForge AI Admin Dashboard provides comprehensive control over your organization's M&A validation platform. As an administrator, you can manage users, teams, billing, and security settings while monitoring usage and ensuring compliance.

**Dashboard Access:**
- Navigate to `/dashboard` after logging in
- Admin features are available in the left sidebar under "Administration"
- Role-based access ensures only authorized users see admin functions

### Key Metrics at a Glance

The dashboard displays real-time organizational metrics:
- **Total Users**: Active user count and growth trends
- **Teams**: Number of collaborative workspaces
- **Monthly Analyses**: Professional validations completed ($500 each)
- **Monthly Cost**: Total spend on M&A analysis services
- **Active Sessions**: Currently logged-in users
- **Security Status**: SSO configuration and compliance indicators

### Quick Actions Panel

Common administrative tasks are accessible via quick action buttons:
- **Invite Users** - Send email invitations to new team members
- **Manage Teams** - Create and organize collaborative workspaces
- **Usage Reports** - Generate cost and usage analytics
- **Security Settings** - Configure authentication and access controls

## Organization Management

### Organization Settings

**Access Path:** Dashboard → Administration → Organization Settings

Configure your organization's core settings and preferences:

```json
{
  "organization": {
    "name": "Acme Consulting",
    "plan_type": "enterprise",
    "domain_whitelist": ["acmeconsulting.com", "acme.com"],
    "billing_email": "billing@acmeconsulting.com",
    "primary_contact": "admin@acmeconsulting.com"
  }
}
```

**Key Configuration Options:**

1. **Domain Whitelist**
   - Add authorized email domains for automatic user provisioning
   - Users from these domains can self-register via SSO
   - Example: `acmeconsulting.com`, `subsidiary.com`

2. **Default User Settings**
   - Default role for new users (typically "analyst")
   - Default cost center assignment
   - Default team membership

3. **Billing Configuration**
   - Payment method setup and management
   - Invoice delivery preferences
   - Budget alert thresholds

### Enterprise Plan Features

**Included with Enterprise:**
- Unlimited users and teams
- Advanced analytics and reporting
- Priority technical support
- Custom integrations and APIs
- Enhanced security features
- Dedicated account manager

## User Management

### Adding New Users

**Method 1: Email Invitation**
1. Navigate to **Administration → Users**
2. Click **Invite User** button
3. Enter email address and select role
4. Add optional cost center and department information
5. Send invitation

**Method 2: SSO Auto-Provisioning**
- Users from whitelisted domains automatically create accounts
- Initial role assigned based on domain configuration
- Account activated upon first successful SSO login

### User Roles and Permissions

**Role Hierarchy and Capabilities:**

| Role | Analysis Limit | Key Permissions | Use Cases |
|------|----------------|-----------------|-----------|
| **Owner** | Unlimited | Full org control, billing, SSO | C-suite, IT directors |
| **Admin** | $2,500/month | User mgmt, team oversight | Operations managers |
| **Manager** | $1,000/month | Team mgmt, team analyses | Team leads, directors |
| **Analyst** | $500/month | Create analyses, collaboration | Consultants, analysts |
| **Viewer** | $0 | View shared content only | Stakeholders, clients |

### Managing User Accounts

**Edit User Profile:**
1. Go to **Administration → Users**
2. Search for user by name or email
3. Click **Edit** to modify:
   - Role and permissions
   - Cost center assignment
   - Department information
   - Analysis approval limits

**Deactivate Users:**
- Temporarily disable access without deleting data
- Useful for employees on leave or transitioning roles
- Reactivation restores full access and historical data

**User Activity Monitoring:**
- Last login timestamps
- Recent analysis activity
- Current session information
- Monthly usage statistics

### Bulk User Operations

**CSV Import:**
```csv
email,full_name,role,department,cost_center
john.doe@acme.com,John Doe,analyst,Corp Dev,CC-001
jane.smith@acme.com,Jane Smith,manager,M&A Advisory,CC-002
```

**Bulk Role Updates:**
- Select multiple users via checkboxes
- Apply role changes to entire groups
- Useful for organizational restructuring

## Team Management

### Creating Teams

**Team Setup Process:**
1. Navigate to **Administration → Teams**
2. Click **Create New Team**
3. Configure team settings:

```json
{
  "name": "M&A Analysis Team",
  "description": "Primary deal evaluation team",
  "team_lead_id": "uuid-of-team-lead",
  "budget_limit_cents": 500000,
  "default_permissions": {
    "can_share_external": false,
    "can_export_data": true,
    "requires_approval": true
  },
  "cost_center": "CC-001",
  "department": "Corporate Development"
}
```

### Team Collaboration Features

**Analysis Sharing:**
- Share analyses between team members
- Granular permissions control (view, edit, comment, export)
- Track sharing history and access logs

**Team Budget Management:**
- Set monthly spending limits per team
- Automatic alerts when approaching limits
- Approval workflows for budget overrides

**Team Performance Metrics:**
- Analysis completion rates
- Quality scores and feedback
- Cost per analysis by team
- ROI comparisons across teams

### Managing Team Memberships

**Add Team Members:**
1. Select team from teams list
2. Click **Add Members** button
3. Search and select users to add
4. Assign member role (lead or member)

**Team Member Roles:**
- **Team Lead**: Can manage team settings and memberships
- **Member**: Standard team access with sharing privileges

**Remove Team Members:**
- Access is immediately revoked
- Historical analysis access maintained
- Audit trail records membership changes

## SSO Configuration

### Google Workspace Integration

**Setup Requirements:**
- Google Workspace admin access
- Domain ownership verification
- OAuth 2.0 application registration

**Configuration Steps:**
1. **Google Cloud Console Setup:**
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs

2. **PrismForge Configuration:**
   ```bash
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Domain Verification:**
   - Add your domain to whitelist
   - Test authentication flow
   - Verify user provisioning

### Microsoft Azure AD Integration

**Enterprise Application Setup:**
1. **Azure Portal Configuration:**
   - Register new application in Azure AD
   - Configure authentication settings
   - Set up application permissions
   - Create client secret

2. **SAML Configuration (Optional):**
   - Configure SAML 2.0 settings
   - Set up attribute mappings
   - Test SAML authentication flow

3. **Group-Based Role Mapping:**
   ```json
   {
     "role_mapping": {
       "Acme-Admins": "admin",
       "Acme-Managers": "manager", 
       "Acme-Analysts": "analyst"
     }
   }
   ```

### Advanced SSO Features

**Conditional Access:**
- Require MFA for sensitive operations
- IP address restrictions
- Device trust requirements
- Geographic access controls

**Just-in-Time (JIT) Provisioning:**
- Automatic user account creation
- Role assignment based on group membership
- Department and cost center mapping

## Usage Monitoring

### Real-Time Usage Dashboard

**Current Month Metrics:**
- Total analyses in progress
- Completed professional validations
- Cost to date and projected spend
- Active user count and peak usage times

**Usage Trends:**
- Weekly and monthly analysis volume
- Cost per analysis trends
- User adoption and engagement rates
- Peak usage periods and capacity planning

### Detailed Usage Reports

**Generate Monthly Reports:**
1. Navigate to **Administration → Usage Reports**
2. Select report period and filters
3. Choose breakdown dimensions:
   - By user and role
   - By department and cost center
   - By analysis type and complexity
   - By team and project

**Sample Report Structure:**
```json
{
  "report_period": "2024-01",
  "summary": {
    "total_analyses": 42,
    "total_cost_cents": 2100000,
    "average_cost_per_analysis": 50000,
    "active_users": 18,
    "cost_savings_vs_traditional": "92%"
  },
  "breakdowns": {
    "by_department": [
      {
        "department": "Corporate Development",
        "analyses": 25,
        "cost_cents": 1250000,
        "users": 8
      }
    ],
    "top_users": [
      {
        "user": "john.doe@acme.com",
        "analyses": 8,
        "cost_cents": 400000
      }
    ]
  }
}
```

### Usage Optimization

**Cost Management Strategies:**
- Set team-level budget limits
- Implement approval workflows for high-cost analyses
- Monitor unusual usage patterns
- Optimize analysis types for efficiency

**Performance Optimization:**
- Identify high-volume users for training
- Share best practices across teams
- Template creation for common analysis types
- Quality improvement programs

## Billing Management

### Payment and Invoicing

**Enterprise Billing Model:**
- **Pay-per-Analysis**: $500 per professional validation
- **Monthly invoicing** with detailed usage breakdown
- **Net 30 payment terms** for enterprise customers
- **Volume discounts** available for 100+ analyses/month

**Payment Methods:**
- ACH/Wire transfer (preferred for enterprise)
- Corporate credit card billing
- Purchase order processing
- Invoice-based billing with NET terms

### Budget Controls

**Organization-Level Controls:**
- Set monthly spending limits
- Configure approval workflows
- Alert thresholds and notifications
- Emergency budget overrides

**Team-Level Controls:**
```json
{
  "team_budget_controls": {
    "monthly_limit_cents": 500000,
    "approval_required_above_cents": 100000,
    "alert_threshold_percent": 80,
    "auto_suspend_at_limit": false
  }
}
```

### Cost Attribution

**Detailed Cost Tracking:**
- Analysis-level cost attribution
- User and team cost centers
- Department budget allocation
- Project-based cost tracking

**Financial Reporting:**
- Monthly cost summaries
- Budget variance analysis
- ROI calculations vs traditional consulting
- Detailed usage invoices

## Security Administration

### Authentication Security

**Session Management:**
- Configure session timeout periods
- Set maximum session duration
- Enable concurrent session limits
- Monitor active user sessions

**Multi-Factor Authentication:**
- Require MFA for administrative actions
- Integration with corporate MFA systems
- Device trust and registration
- Emergency access procedures

### Access Controls

**IP Address Restrictions:**
```json
{
  "access_controls": {
    "ip_whitelist": [
      "192.168.1.0/24",
      "10.0.0.0/8"
    ],
    "geo_restrictions": {
      "allowed_countries": ["US", "CA", "UK"],
      "blocked_countries": []
    }
  }
}
```

**Device Security:**
- Trusted device registration
- Mobile device management integration
- Screen recording prevention
- Download restrictions for sensitive data

### Data Protection

**Data Loss Prevention:**
- Watermarking of downloaded documents
- Email attachment blocking
- Print restrictions and audit trails
- External sharing controls

**Encryption Settings:**
- End-to-end encryption for sensitive data
- Key rotation policies
- Backup encryption verification
- Compliance with encryption standards

## Audit and Compliance

### Audit Log Management

**Comprehensive Logging:**
- All user authentication events
- Data access and modification logs
- Administrative actions and changes
- System configuration modifications
- Billing and usage events

**Log Retention:**
- **7 years** for regulatory compliance
- **Immutable storage** preventing tampering
- **Real-time monitoring** for suspicious activity
- **Automated alerting** for security events

### Compliance Reporting

**SOC 2 Compliance:**
- Quarterly compliance assessments
- Control testing documentation
- Incident response procedures
- Vendor risk management

**GDPR Compliance:**
- Data subject rights management
- Consent tracking and management
- Data retention policies
- Privacy impact assessments

### Generating Audit Reports

**Standard Reports:**
1. **User Activity Report**
   - Login/logout events
   - Data access patterns
   - Failed authentication attempts

2. **Data Access Report**
   - Analysis viewing and modification
   - Data export events
   - Sharing activity logs

3. **Administrative Actions Report**
   - User role changes
   - System configuration updates
   - Security setting modifications

**Custom Report Builder:**
- Filter by date ranges
- Select specific users or teams
- Choose event types and severity
- Export in multiple formats (PDF, CSV, Excel)

## Troubleshooting

### Common Issues

**SSO Login Problems:**
1. **Symptoms**: Users can't authenticate via Google/Microsoft
2. **Diagnosis**: Check OAuth configuration and redirect URIs
3. **Resolution**: 
   - Verify client ID/secret in environment variables
   - Check domain whitelist configuration
   - Test OAuth flow in developer tools

**User Permission Issues:**
1. **Symptoms**: Users can't access expected features
2. **Diagnosis**: Review role assignments and permissions
3. **Resolution**:
   - Verify user role in Admin → Users
   - Check team memberships
   - Review organization-level permissions

**Billing Discrepancies:**
1. **Symptoms**: Usage reports don't match invoices
2. **Diagnosis**: Compare usage logs with billing records
3. **Resolution**:
   - Review analysis approval dates
   - Check for pending/cancelled analyses
   - Verify cost center attributions

### Performance Issues

**Slow Dashboard Loading:**
- Check browser network console for failed API calls
- Verify Supabase connectivity and performance
- Review usage patterns during peak hours

**Analysis Processing Delays:**
- Monitor Claude AI API rate limits
- Check document size and complexity
- Review queue processing status

### Getting Help

**Support Channels:**
- **Enterprise Support**: enterprise-support@prismforge.ai
- **Technical Documentation**: https://docs.prismforge.ai
- **Status Page**: https://status.prismforge.ai
- **Emergency Support**: Available 24/7 for critical issues

**Support Information to Provide:**
- Organization ID and admin user email
- Specific error messages or screenshots
- Steps to reproduce the issue
- Browser/device information
- Approximate time the issue occurred

### Escalation Procedures

**Severity Levels:**
- **Critical (P1)**: System outage, security incident (2-hour response)
- **High (P2)**: Major feature disruption (8-hour response)
- **Medium (P3)**: Minor feature issues (24-hour response)
- **Low (P4)**: Questions and enhancement requests (48-hour response)

## Best Practices

### Security Best Practices

1. **Regular Access Reviews**
   - Monthly user access audits
   - Quarterly role assignment reviews
   - Annual security policy updates

2. **Incident Response**
   - Maintain updated contact lists
   - Test incident response procedures
   - Document lessons learned

3. **User Training**
   - Security awareness training
   - Platform usage best practices
   - Compliance requirement education

### Operational Best Practices

1. **Change Management**
   - Test configuration changes in staging
   - Document all administrative changes
   - Maintain rollback procedures

2. **Monitoring and Alerting**
   - Set up usage threshold alerts
   - Monitor authentication failure rates
   - Track performance metrics

3. **Data Management**
   - Regular backup verification
   - Data retention policy enforcement
   - Privacy compliance monitoring

---

*Administrator Guide Version 2.1*  
*Last Updated: January 2024*  
*For questions or feedback: admin-docs@prismforge.ai*