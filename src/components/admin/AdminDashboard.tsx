'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus,
  Shield, 
  TrendingUp, 
  DollarSign,
  Building,
  Calendar,
  Activity,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  organizationId: string;
  userRole: string;
}

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTeams: number;
  monthlyAnalyses: number;
  monthlyCostCents: number;
  activeSessions: number;
  pendingInvites: number;
  ssoEnabled: boolean;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  resourceType: string;
}

export default function AdminDashboard({ organizationId, userRole }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [organizationId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load metrics
      const metricsResponse = await fetch(`/api/admin/metrics?orgId=${organizationId}`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Load recent activity
      const activityResponse = await fetch(`/api/admin/activity?orgId=${organizationId}&limit=10`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organization Dashboard</h1>
          <p className="text-gray-600">Manage your PrismForge AI enterprise account</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.activeUsers || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalTeams || 0}</div>
            <p className="text-xs text-muted-foreground">
              Collaborative workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Analyses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.monthlyAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Professional validations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics?.monthlyCostCents || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              $500 per professional validation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>Enterprise security and compliance overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {metrics?.ssoEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <span>Single Sign-On (SSO)</span>
            </div>
            <Badge variant={metrics?.ssoEnabled ? 'default' : 'secondary'}>
              {metrics?.ssoEnabled ? 'Enabled' : 'Not Configured'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span>Active Sessions</span>
            </div>
            <Badge variant="outline">{metrics?.activeSessions || 0}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span>Audit Logging</span>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest administrative actions and user activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.resourceType} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {activity.resourceType}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start h-auto p-4">
              <UserPlus className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Invite Users</div>
                <div className="text-xs text-gray-500">Add new team members</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <Building className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Manage Teams</div>
                <div className="text-xs text-gray-500">Create and organize teams</div>
              </div>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Usage Reports</div>
                <div className="text-xs text-gray-500">View cost and usage analytics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}