import React from 'react';
import { useAuth } from '@/hooks/use-auth';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requireAuth?: boolean;
}

export function RouteGuard({ 
  children, 
  fallback = null,
  requiredPermission,
  requiredRole,
  requireAuth = true
}: RouteGuardProps) {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Higher-order component for route protection
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...guardProps}>
        <Component {...props} />
      </RouteGuard>
    );
  };
}

// Hook for conditional rendering based on permissions
export function useConditionalRender() {
  const { isAuthenticated, hasPermission, hasRole } = useAuth();

  const canRender = React.useCallback((conditions: {
    requireAuth?: boolean;
    requiredPermission?: string;
    requiredRole?: string;
  }) => {
    const { requireAuth = true, requiredPermission, requiredRole } = conditions;

    if (requireAuth && !isAuthenticated) return false;
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;

    return true;
  }, [isAuthenticated, hasPermission, hasRole]);

  return { canRender };
}