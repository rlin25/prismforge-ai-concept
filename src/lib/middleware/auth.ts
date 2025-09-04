// Authentication Middleware for API Routes
// PrismForge AI - Enterprise Authentication

import { NextRequest, NextResponse } from 'next/server';
import { PermissionManager } from '../auth/permissions';

// Middleware for API routes
export function withAuth(handler: Function, requiredPermission?: string) {
  return async (request: NextRequest) => {
    const permissionManager = new PermissionManager();
    
    // Extract token from cookie
    const token = request.cookies.get('session_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Validate session
    const validation = await permissionManager.validateSession(token);
    
    if (!validation.valid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    // Check required permission
    if (requiredPermission) {
      const hasPermission = await permissionManager.checkPermission(
        validation.user.id,
        requiredPermission
      );
      
      if (!hasPermission) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }
    
    // Add user context to request
    (request as any).user = validation.user;
    (request as any).session = validation.session;
    
    return handler(request);
  };
}

// Usage example:
// export const GET = withAuth(async (request: NextRequest) => {
//   const user = (request as any).user;
//   return NextResponse.json({ user });
// }, 'analyses.view_own');

export default withAuth;