// Route configuration with permission requirements
export interface RouteConfig {
  path: string;
  requireAuth: boolean;
  requiredPermission?: string;
  requiredRole?: string;
  publicRoute?: boolean;
}

// Define route permissions
export const ROUTE_PERMISSIONS = {
  // Dashboard routes
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_EDIT: 'dashboard:edit',
  
  // User management routes
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  
  // Settings routes
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  
  // System administration
  SYSTEM_ADMIN: 'system:admin',
} as const;

// Define user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
} as const;

// Route configuration mapping
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Public routes
  '/': {
    path: '/',
    requireAuth: true,
    publicRoute: false,
  },
  '/login': {
    path: '/login',
    requireAuth: false,
    publicRoute: true,
  },
  '/password-reset': {
    path: '/password-reset',
    requireAuth: false,
    publicRoute: true,
  },
  
  // Protected routes
  '/dashboard': {
    path: '/dashboard',
    requireAuth: true,
    requiredPermission: ROUTE_PERMISSIONS.DASHBOARD_VIEW,
  },
  '/users': {
    path: '/users',
    requireAuth: true,
    requiredPermission: ROUTE_PERMISSIONS.USERS_VIEW,
  },
  '/settings': {
    path: '/settings',
    requireAuth: true,
    requiredPermission: ROUTE_PERMISSIONS.SETTINGS_VIEW,
  },
  
  // Admin-only routes
  '/admin': {
    path: '/admin',
    requireAuth: true,
    requiredRole: USER_ROLES.ADMIN,
  },
};

// Helper function to get route config
export function getRouteConfig(path: string): RouteConfig | undefined {
  return ROUTE_CONFIG[path];
}

// Helper function to check if route is public
export function isPublicRoute(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.publicRoute === true;
}

// Helper function to check if route requires authentication
export function requiresAuth(path: string): boolean {
  const config = getRouteConfig(path);
  return config?.requireAuth !== false;
}