import React from 'react';
import { useLocation } from '@tanstack/react-router';
import { ProtectedRoute } from './protected-route';
import { getRouteConfig } from '@/lib/route-config';

interface AuthRouteWrapperProps {
  children: React.ReactNode;
}

export function AuthRouteWrapper({ children }: AuthRouteWrapperProps) {
  const location = useLocation();
  const routeConfig = getRouteConfig(location.pathname);

  // If no route config found or it's a public route, render without protection
  if (!routeConfig || routeConfig.publicRoute) {
    return <>{children}</>;
  }

  // If route doesn't require auth, render without protection
  if (!routeConfig.requireAuth) {
    return <>{children}</>;
  }

  // Apply protection based on route configuration
  return (
    <ProtectedRoute
      requiredPermission={routeConfig.requiredPermission}
      requiredRole={routeConfig.requiredRole}
    >
      {children}
    </ProtectedRoute>
  );
}