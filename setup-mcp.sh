#!/bin/bash

# PrismForge AI - Supabase MCP Setup Script
# This script sets up the MCP configuration for Supabase database access

set -e

echo "Setting up Supabase MCP configuration..."

# Load environment variables
if [ -f .env.local ]; then
    source .env.local
else
    echo "Error: .env.local file not found"
    exit 1
fi

# Extract Supabase credentials
SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
DB_PASSWORD=${SUPABASE_DB_PASSWORD}

# Parse Supabase URL to get database connection details
if [[ $SUPABASE_URL =~ https://([^.]+)\.supabase\.co ]]; then
    PROJECT_REF="${BASH_REMATCH[1]}"
    POSTGRES_HOST="aws-0-us-east-1.pooler.supabase.com"
    POSTGRES_USER="postgres.${PROJECT_REF}"
    POSTGRES_DATABASE="postgres"
    POSTGRES_PORT="6543"
else
    echo "Error: Could not parse Supabase URL"
    exit 1
fi

echo "Project Reference: $PROJECT_REF"
echo "Database Host: $POSTGRES_HOST"
echo "Database User: $POSTGRES_USER"

# Create MCP configuration for Claude Code
mkdir -p ~/.config/claude-code

cat > ~/.config/claude-code/mcp.json << EOF
{
  "mcpServers": {
    "supabase-admin": {
      "command": "enhanced-postgres-mcp-server",
      "args": [],
      "env": {
        "POSTGRES_HOST": "$POSTGRES_HOST",
        "POSTGRES_PORT": "$POSTGRES_PORT", 
        "POSTGRES_DATABASE": "$POSTGRES_DATABASE",
        "POSTGRES_USER": "$POSTGRES_USER",
        "POSTGRES_PASSWORD": "$DB_PASSWORD",
        "POSTGRES_SSL": "true"
      }
    },
    "supabase-app": {
      "command": "enhanced-postgres-mcp-server",
      "args": [],
      "env": {
        "POSTGRES_HOST": "$POSTGRES_HOST",
        "POSTGRES_PORT": "$POSTGRES_PORT",
        "POSTGRES_DATABASE": "$POSTGRES_DATABASE", 
        "POSTGRES_USER": "$POSTGRES_USER",
        "POSTGRES_PASSWORD": "$DB_PASSWORD",
        "POSTGRES_SSL": "true"
      }
    }
  }
}
EOF

# Also create a local project MCP config for reference
cat > ./mcp.json << EOF
{
  "mcpServers": {
    "supabase-admin": {
      "command": "enhanced-postgres-mcp-server",
      "args": [],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://$POSTGRES_USER:$DB_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DATABASE?sslmode=require"
      }
    },
    "supabase-app": {
      "command": "enhanced-postgres-mcp-server", 
      "args": [],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://$POSTGRES_USER:$DB_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DATABASE?sslmode=require"
      }
    }
  }
}
EOF

echo "✅ MCP configuration created successfully!"
echo "📍 Global config: ~/.config/claude-code/mcp.json"
echo "📍 Local config: ./mcp.json"
echo ""
echo "🔧 Available MCP servers:"
echo "  - supabase-admin: Full database access with service role"
echo "  - supabase-app: Application-level access with anon key"
echo ""
echo "🚀 To use with Claude Code, restart your Claude session to load the new MCP servers."