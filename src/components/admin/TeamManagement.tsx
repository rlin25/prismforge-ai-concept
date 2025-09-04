'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Plus,
  Settings,
  Trash2,
  Crown,
  Calendar,
  DollarSign,
  Building,
  UserPlus,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface TeamManagementProps {
  organizationId: string;
  userRole: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  team_lead_id?: string;
  team_budget_limit_cents?: number;
  created_at: string;
  member_count: number;
  lead_name?: string;
  recent_activity?: string;
}

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  role: 'lead' | 'member';
  joined_at: string;
  last_login?: string;
  user_role: string;
}

export default function TeamManagement({ organizationId, userRole }: TeamManagementProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTeamDetails, setShowTeamDetails] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [organizationId]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/teams?orgId=${organizationId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        throw new Error('Failed to load teams');
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`);
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };

  const handleTeamClick = async (team: Team) => {
    setSelectedTeam(team);
    await loadTeamMembers(team.id);
    setShowTeamDetails(true);
  };

  const formatCurrency = (cents: number | undefined) => {
    if (!cents) return 'No limit';
    return `$${(cents / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const canManageTeams = ['owner', 'admin', 'manager'].includes(userRole);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-gray-600">Manage teams and collaboration for your organization</p>
        </div>
        {canManageTeams && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Create a new team for collaboration and project organization.
                </DialogDescription>
              </DialogHeader>
              <CreateTeamForm 
                organizationId={organizationId}
                onSuccess={() => {
                  setShowCreateDialog(false);
                  loadTeams();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Card 
            key={team.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleTeamClick(team)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {team.name}
                  </CardTitle>
                  {team.description && (
                    <CardDescription className="mt-1">
                      {team.description}
                    </CardDescription>
                  )}
                </div>
                {canManageTeams && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Members
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{team.member_count} members</span>
                </div>
                {team.lead_name && (
                  <div className="flex items-center gap-1">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-gray-500">{team.lead_name}</span>
                  </div>
                )}
              </div>

              {team.team_budget_limit_cents && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm">
                    Budget: {formatCurrency(team.team_budget_limit_cents)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {formatDate(team.created_at)}
                </div>
                {team.recent_activity && (
                  <span>{team.recent_activity}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {teams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No teams yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first team to start collaborating on M&A analyses.
            </p>
            {canManageTeams && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Team
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Team Details Modal */}
      <Dialog open={showTeamDetails} onOpenChange={setShowTeamDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription>
              Team details and member management
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeam && (
            <TeamDetailsView 
              team={selectedTeam}
              members={teamMembers}
              canManage={canManageTeams}
              onMemberUpdate={() => loadTeamMembers(selectedTeam.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Team Details Component
interface TeamDetailsViewProps {
  team: Team;
  members: TeamMember[];
  canManage: boolean;
  onMemberUpdate: () => void;
}

function TeamDetailsView({ team, members, canManage, onMemberUpdate }: TeamDetailsViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Budget Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {team.team_budget_limit_cents ? 
                `$${(team.team_budget_limit_cents / 100).toLocaleString()}` : 
                'Unlimited'
              }
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(team.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Team Members</CardTitle>
            {canManage && (
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.full_name || member.email}</span>
                    {member.role === 'lead' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    <Badge variant="outline">{member.user_role}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  <p className="text-xs text-gray-400">
                    Joined {formatDate(member.joined_at)}
                    {member.last_login && ` • Last login ${formatDate(member.last_login)}`}
                  </p>
                </div>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem>
                        <Crown className="h-4 w-4 mr-2" />
                        {member.role === 'lead' ? 'Remove Lead' : 'Make Lead'}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}

            {members.length === 0 && (
              <div className="text-center py-6">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No team members yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create Team Form Component
interface CreateTeamFormProps {
  organizationId: string;
  onSuccess: () => void;
}

function CreateTeamForm({ organizationId, onSuccess }: CreateTeamFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budgetLimitCents: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          name: formData.name,
          description: formData.description || undefined,
          budgetLimitCents: formData.budgetLimitCents ? parseInt(formData.budgetLimitCents) * 100 : undefined
        })
      });

      if (response.ok) {
        onSuccess();
      } else {
        throw new Error('Failed to create team');
      }
    } catch (err) {
      console.error('Failed to create team:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Team Name *</label>
        <input
          type="text"
          required
          className="w-full p-2 border rounded-md"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., M&A Analytics Team"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full p-2 border rounded-md"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the team's purpose..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Budget Limit (USD)</label>
        <input
          type="number"
          className="w-full p-2 border rounded-md"
          value={formData.budgetLimitCents}
          onChange={(e) => setFormData({ ...formData, budgetLimitCents: e.target.value })}
          placeholder="Optional monthly budget limit"
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty for unlimited budget. Each professional validation costs $500.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setFormData({ name: '', description: '', budgetLimitCents: '' })}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name}>
          {loading ? 'Creating...' : 'Create Team'}
        </Button>
      </div>
    </form>
  );
}