#!/usr/bin/env node

// Custom Supabase MCP Server for PrismForge AI
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { createClient } = require('@supabase/supabase-js');

// Load environment
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

class SupabaseMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'supabase-prismforge',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_organizations',
            description: 'Query organizations table in PrismForge AI database',
            inputSchema: {
              type: 'object',
              properties: {
                select: { type: 'string', description: 'Columns to select (default: *)' },
                filter: { type: 'object', description: 'Filters to apply' },
                limit: { type: 'number', description: 'Limit number of results' },
              },
            },
          },
          {
            name: 'query_users',
            description: 'Query users table in PrismForge AI database',
            inputSchema: {
              type: 'object',
              properties: {
                select: { type: 'string', description: 'Columns to select (default: *)' },
                filter: { type: 'object', description: 'Filters to apply' },
                limit: { type: 'number', description: 'Limit number of results' },
              },
            },
          },
          {
            name: 'query_analysis_sessions',
            description: 'Query analysis sessions table in PrismForge AI database',
            inputSchema: {
              type: 'object',
              properties: {
                select: { type: 'string', description: 'Columns to select (default: *)' },
                filter: { type: 'object', description: 'Filters to apply' },
                limit: { type: 'number', description: 'Limit number of results' },
              },
            },
          },
          {
            name: 'query_teams',
            description: 'Query teams table in PrismForge AI database',
            inputSchema: {
              type: 'object',
              properties: {
                select: { type: 'string', description: 'Columns to select (default: *)' },
                filter: { type: 'object', description: 'Filters to apply' },
                limit: { type: 'number', description: 'Limit number of results' },
              },
            },
          },
          {
            name: 'create_organization',
            description: 'Create a new organization in PrismForge AI',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Organization name' },
                domain: { type: 'string', description: 'Organization domain' },
                plan_type: { type: 'string', description: 'Plan type (individual/team/enterprise)' },
                settings: { type: 'object', description: 'Organization settings' },
              },
              required: ['name'],
            },
          },
          {
            name: 'create_user',
            description: 'Create a new user in PrismForge AI',
            inputSchema: {
              type: 'object',
              properties: {
                email: { type: 'string', description: 'User email' },
                organization_id: { type: 'string', description: 'Organization ID' },
                role: { type: 'string', description: 'User role' },
                full_name: { type: 'string', description: 'Full name' },
              },
              required: ['email', 'organization_id'],
            },
          },
          {
            name: 'run_sql',
            description: 'Execute custom SQL query (read-only)',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'SQL query to execute' },
                params: { type: 'array', description: 'Query parameters' },
              },
              required: ['query'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'query_organizations':
            return await this.queryTable('organizations', args);
          
          case 'query_users':
            return await this.queryTable('users', args);
          
          case 'query_analysis_sessions':
            return await this.queryTable('analysis_sessions', args);
          
          case 'query_teams':
            return await this.queryTable('teams', args);
          
          case 'create_organization':
            return await this.createOrganization(args);
          
          case 'create_user':
            return await this.createUser(args);
          
          case 'run_sql':
            return await this.runSQL(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async queryTable(tableName, args) {
    const { select = '*', filter = {}, limit = 100 } = args;
    
    let query = supabase.from(tableName).select(select).limit(limit);
    
    // Apply filters
    Object.entries(filter).forEach(([column, value]) => {
      if (typeof value === 'object' && value.operator) {
        // Advanced filter: { operator: 'eq', value: 'something' }
        query = query.filter(column, value.operator, value.value);
      } else {
        // Simple equality filter
        query = query.eq(column, value);
      }
    });
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${data.length} records in ${tableName}:\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async createOrganization(args) {
    const { name, domain, plan_type = 'individual', settings = {} } = args;
    
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name,
        domain,
        plan_type,
        settings,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Organization created successfully:\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async createUser(args) {
    const { email, organization_id, role = 'analyst', full_name } = args;
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        organization_id,
        role,
        full_name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `User created successfully:\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async runSQL(args) {
    const { query, params = [] } = args;
    
    // Basic security: only allow SELECT statements
    if (!query.trim().toLowerCase().startsWith('select')) {
      throw new Error('Only SELECT statements are allowed');
    }
    
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: query,
      sql_params: params,
    });
    
    if (error) {
      throw new Error(`SQL execution error: ${error.message}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `SQL Query Results:\\n${JSON.stringify(data, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Supabase MCP server running on stdio');
  }
}

// Start the server
const server = new SupabaseMCPServer();
server.run().catch(console.error);