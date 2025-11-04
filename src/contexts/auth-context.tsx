import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthContextType, AuthState, LoginCredentials, User, AuthTokens } from '@/types/auth';
import { AuthStorage } from '@/lib/auth-storage';
import { AuthAPI } from '@/lib/auth-api';

// Auth reducer actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH_SUCCESS'; payload: AuthTokens }
  | { type: 'SET_USER'; payload: User };

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'AUTH_REFRESH_SUCCESS':
      return {
        ...state,
        tokens: action.payload,
        error: null,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = AuthStorage.getTokens();
        const user = AuthStorage.getUser();

        if (tokens && user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, tokens } });
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!state.tokens) return;

    const timeUntilExpiry = state.tokens.expiresAt - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    const timeoutId = setTimeout(() => {
      refreshAuth();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [state.tokens]);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await AuthAPI.login(credentials);
      
      // Store tokens and user data
      AuthStorage.setTokens(response.tokens);
      AuthStorage.setUser(response.user);
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (state.tokens?.refreshToken) {
        await AuthAPI.logout(state.tokens.refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear storage and state regardless of API call success
      AuthStorage.clearAll();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, [state.tokens]);

  // Refresh authentication
  const refreshAuth = useCallback(async (): Promise<void> => {
    if (!state.tokens?.refreshToken) {
      logout();
      return;
    }

    try {
      const newTokens = await AuthAPI.refreshToken(state.tokens.refreshToken);
      AuthStorage.setTokens(newTokens);
      dispatch({ type: 'AUTH_REFRESH_SUCCESS', payload: newTokens });
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  }, [state.tokens, logout]);

  // Check if user has specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user?.role?.permissions) return false;
    
    return state.user.role.permissions.some(p => 
      p.name === permission || 
      `${p.resource}:${p.action}` === permission
    );
  }, [state.user]);

  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    return state.user?.role?.name === role;
  }, [state.user]);

  const contextValue: AuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    refreshAuth,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}