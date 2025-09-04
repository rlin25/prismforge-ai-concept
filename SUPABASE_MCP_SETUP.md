# Supabase MCP Setup for PrismForge AI

## Overview

This document outlines the setup of Model Context Protocol (MCP) integration with Supabase for the PrismForge AI project. This enables Claude Code to interact directly with the Supabase database for data analysis and management.

## Components Installed

### 1. Enhanced PostgreSQL MCP Server
- **Package**: `enhanced-postgres-mcp-server`
- **Purpose**: Direct PostgreSQL database access via MCP
- **Features**: Read and write capabilities for database operations

### 2. Custom Supabase MCP Server
- **File**: `supabase-mcp-server.js`
- **Purpose**: Supabase-specific MCP server using REST API
- **Features**: Organization, user, and analysis session management

## Configuration Files

### Global MCP Configuration
**Location**: `~/.config/claude-code/mcp.json`

```json
{
  "mcpServers": {
    "supabase-admin": {
      "command": "enhanced-postgres-mcp-server",
      "args": [],
      "env": {
        "POSTGRES_HOST": "aws-0-us-east-1.pooler.supabase.com",
        "POSTGRES_PORT": "6543", 
        "POSTGRES_DATABASE": "postgres",
        "POSTGRES_USER": "postgres.hshmedkrowhzsyngmruc",
        "POSTGRES_PASSWORD": "sbp_0967d1116140377ad597b47b52272403f23d1c0a",
        "POSTGRES_SSL": "true"
      }
    }
  }
}
```

### Project MCP Configuration
**Location**: `./mcp.json`

```json
{
  "mcpServers": {
    "supabase-admin": {
      "command": "enhanced-postgres-mcp-server",
      "args": [],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://postgres.hshmedkrowhzsyngmruc:sbp_0967d1116140377ad597b47b52272403f23d1c0a@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
      }
    }
  }
}
```

## Environment Variables

### Required in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hshmedkrowhzsyngmruc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=sbp_0967d1116140377ad597b47b52272403f23d1c0a
```

## Available MCP Tools

### Enhanced PostgreSQL MCP Server Tools
1. **Database Queries**: Execute SQL queries on Supabase database
2. **Table Operations**: Create, read, update, delete operations
3. **Schema Inspection**: View table structures and relationships

### Custom Supabase MCP Server Tools
1. **query_organizations**: Query organizations table
2. **query_users**: Query users table  
3. **query_analysis_sessions**: Query analysis sessions table
4. **query_teams**: Query teams table
5. **create_organization**: Create new organization
6. **create_user**: Create new user
7. **run_sql**: Execute custom SQL queries (read-only)

## Database Connection Details

- **Host**: `aws-0-us-east-1.pooler.supabase.com`
- **Port**: `6543`
- **Database**: `postgres`
- **User**: `postgres.hshmedkrowhzsyngmruc`
- **Password**: `sbp_0967d1116140377ad597b47b52272403f23d1c0a`
- **SSL**: Required

## Setup Scripts

### `setup-mcp.sh`
Automated setup script that:
1. Reads configuration from `.env.local`
2. Creates MCP configuration files
3. Sets up both global and project-level configs

### Usage:
```bash
chmod +x setup-mcp.sh
./setup-mcp.sh
```

## Testing

### Test Scripts Available:
1. **`test-supabase-direct.js`**: Tests Supabase REST API connection
2. **`test-postgres-connection.js`**: Tests PostgreSQL direct connection
3. **`test-mcp-connection.js`**: Tests MCP server functionality

### Run Tests:
```bash
node test-supabase-direct.js    # REST API test (working ✅)
node test-postgres-connection.js # PostgreSQL test 
```

## PrismForge AI Database Schema

### Core Tables:
- **organizations**: Company/client organizations
- **users**: User accounts with role-based access
- **analysis_sessions**: M&A validation analysis sessions
- **teams**: Team collaboration structures
- **team_memberships**: User-team relationships

### Enterprise Features:
- Multi-tenant data isolation
- Role-based permissions (owner, admin, manager, analyst, viewer)
- Pay-per-analysis billing ($500 per professional validation)
- Team collaboration and sharing

## Usage with Claude Code

After setup, restart your Claude Code session to load the new MCP servers. You can then:

1. **Query Database**: Ask Claude to query organizations, users, or analysis data
2. **Create Records**: Request creation of new organizations or users
3. **Analyze Data**: Perform data analysis on M&A validation results
4. **Generate Reports**: Create usage and cost attribution reports

## Troubleshooting

### Common Issues:
1. **Connection Refused**: Ensure database password is correct
2. **Permission Denied**: Verify service role key has proper permissions
3. **SSL Errors**: Ensure SSL is enabled in connection string

### Debug Commands:
```bash
# Test Supabase connectivity
node test-supabase-direct.js

# Check MCP configuration
cat ~/.config/claude-code/mcp.json

# Verify environment variables
grep SUPABASE .env.local
```

## Security Notes

- Database password (`sbp_0967d1116140377ad597b47b52272403f23d1c0a`) provides direct database access
- Service role key bypasses Row Level Security (RLS) policies
- Store credentials securely and never commit to version control
- Consider using connection pooling for production deployments

## Next Steps

1. **Restart Claude Code** to load MCP servers
2. **Test MCP functionality** with simple queries
3. **Implement enterprise authentication** features from Prompt 4
4. **Set up monitoring** for database connections and usage
5. **Configure backup and disaster recovery** procedures

---

✅ **Setup Complete**: Supabase MCP is now configured for PrismForge AI
🚀 **Ready for Enterprise**: Multi-tenant M&A validation platform with pay-per-analysis billing