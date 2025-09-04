'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Building } from 'lucide-react';

interface ProfessionalHeaderProps {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    organization: {
      name: string;
      planType: string;
    };
  };
  onSignOut?: () => void;
}

export function ProfessionalHeader({ user, onSignOut }: ProfessionalHeaderProps) {
  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return 'bg-primary text-primary-foreground';
      case 'team':
        return 'bg-validator-blue-500 text-white';
      default:
        return 'bg-surface border border-border text-text-secondary';
    }
  };

  return (
    <header className="bg-surface-elevated border-b border-border shadow-professional">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Branding */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-prism-blue-600 via-skeptic-blue-700 to-validator-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-text-primary">
                  PrismForge AI
                </h1>
                <p className="text-xs text-text-tertiary">
                  Enterprise M&A Validation Platform
                </p>
              </div>
            </div>

            {/* Organization Badge */}
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <Building className="w-4 h-4 text-text-tertiary" />
                <span className="text-sm text-text-secondary">
                  {user.organization.name}
                </span>
                <Badge 
                  className={`text-xs ${getPlanBadgeColor(user.organization.planType)}`}
                >
                  {user.organization.planType.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>

          {/* Professional Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
              Analysis History
            </Button>
            <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary">
              Team
            </Button>
          </nav>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 hover:bg-surface"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" alt={user.fullName || user.email} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(user.fullName || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-text-primary">
                      {user.fullName || user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.fullName || 'Professional User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm">
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Organization Info */}
        {user && (
          <div className="md:hidden mt-2 flex items-center space-x-2">
            <Building className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm text-text-secondary">
              {user.organization.name}
            </span>
            <Badge 
              className={`text-xs ${getPlanBadgeColor(user.organization.planType)}`}
            >
              {user.organization.planType.toUpperCase()}
            </Badge>
          </div>
        )}
      </div>
    </header>
  );
}