import { useAuth as useAuthContext } from '@/contexts/auth-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoginCredentials, PasswordResetRequest } from '@/types/auth';
import { AuthAPI } from '@/lib/auth-api';

// Re-export the main auth hook
export { useAuth } from '@/contexts/auth-context';

// Hook for login mutation
export function useLogin() {
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

// Hook for logout mutation
export function useLogout() {
  const { logout } = useAuthContext();
  
  return useMutation({
    mutationFn: () => logout(),
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
}

// Hook for password reset request
export function usePasswordReset() {
  return useMutation({
    mutationFn: (request: PasswordResetRequest) => AuthAPI.requestPasswordReset(request),
    onError: (error) => {
      console.error('Password reset error:', error);
    },
  });
}

// Hook for password reset confirmation
export function usePasswordResetConfirm() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) => 
      AuthAPI.confirmPasswordReset(token, newPassword),
    onError: (error) => {
      console.error('Password reset confirmation error:', error);
    },
  });
}

// Hook to check authentication status
export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  
  return {
    isAuthenticated,
    isLoading,
    user,
  };
}

// Hook for permission checking
export function usePermissions() {
  const { hasPermission, hasRole, user } = useAuthContext();
  
  return {
    hasPermission,
    hasRole,
    permissions: user?.role?.permissions || [],
    role: user?.role,
  };
}

// Hook for session management
export function useSession() {
  const { refreshAuth, logout, isAuthenticated } = useAuthContext();
  
  // Query to periodically check session validity
  const sessionQuery = useQuery({
    queryKey: ['session-check'],
    queryFn: () => Promise.resolve(isAuthenticated),
    enabled: isAuthenticated,
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    refetchIntervalInBackground: false,
  });
  
  return {
    refreshSession: refreshAuth,
    endSession: logout,
    isSessionValid: sessionQuery.data,
  };
}