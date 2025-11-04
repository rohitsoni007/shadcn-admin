import { createLazyRoute } from './lazy-loading';

// Lazy load route components for better performance
export const LazyDashboard = createLazyRoute(
  () => import('../routes/dashboard').then(module => ({ default: module.Route.options.component! })),
  'Loading dashboard...'
);

export const LazyUsers = createLazyRoute(
  () => import('../components/users/UsersPage').then(module => ({ default: module.UsersPage })),
  'Loading users...'
);

export const LazySettings = createLazyRoute(
  () => import('../components/settings/SettingsPage').then(module => ({ default: module.SettingsPage })),
  'Loading settings...'
);

export const LazyLogin = createLazyRoute(
  () => import('../components/auth/LoginPage').then(module => ({ default: module.LoginPage })),
  'Loading login...'
);

export const LazyPasswordReset = createLazyRoute(
  () => import('../components/auth/PasswordResetPage').then(module => ({ default: module.PasswordResetPage })),
  'Loading password reset...'
);