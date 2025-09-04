// Enterprise Teams API
// PrismForge AI - Team Management Endpoints

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withAuth } from '@/lib/middleware/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/enterprise/teams - List teams for user's organization
async function getTeams(request: NextRequest) {
  try {
    const user = (request as any).user;
    
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_memberships!inner(
          user_id,
          role,
          users(first_name, last_name, email)
        )
      `)
      .eq('organization_id', user.organization_id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ teams });
    
  } catch (error) {
    console.error('Teams fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

// POST /api/enterprise/teams - Create new team
async function createTeam(request: NextRequest) {
  try {
    const user = (request as any).user;
    const { name, description, teamBudgetLimitCents } = await request.json();
    
    // Create team
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        organization_id: user.organization_id,
        name,
        description,
        team_lead_id: user.id,
        team_budget_limit_cents: teamBudgetLimitCents
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ team }, { status: 201 });
    
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}

// Export with authentication middleware
export const GET = withAuth(getTeams, 'teams.manage');
export const POST = withAuth(createTeam, 'teams.manage');