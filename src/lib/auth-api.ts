import type { LoginCredentials, AuthTokens, User, PasswordResetRequest } from '@/types/auth';

// Mock API endpoints - replace with actual API calls
const API_BASE_URL = '/api/auth';
const IS_DEVELOPMENT = import.meta.env.DEV;

// Mock user data for development
const MOCK_USER: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: {
    id: '1',
    name: 'admin',
    permissions: [
      { id: '1', name: 'dashboard:view', resource: 'dashboard', action: 'view' },
      { id: '2', name: 'dashboard:edit', resource: 'dashboard', action: 'edit' },
      { id: '3', name: 'users:view', resource: 'users', action: 'view' },
      { id: '4', name: 'users:create', resource: 'users', action: 'create' },
      { id: '5', name: 'users:edit', resource: 'users', action: 'edit' },
      { id: '6', name: 'users:delete', resource: 'users', action: 'delete' },
      { id: '7', name: 'settings:view', resource: 'settings', action: 'view' },
      { id: '8', name: 'settings:edit', resource: 'settings', action: 'edit' },
    ]
  },
  preferences: {
    theme: 'system',
    sidebarCollapsed: false,
    dashboardLayout: [],
    notifications: {
      email: true,
      push: true,
      inApp: true,
    }
  },
  createdAt: new Date('2024-01-01'),
  lastLoginAt: new Date(),
};

const MOCK_TOKENS: AuthTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
};

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

      // Accept any credentials in development
      if (credentials.email && credentials.password) {
        return {
          user: MOCK_USER,
          tokens: MOCK_TOKENS,
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }

    // Real API call for production
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  static async logout(refreshToken: string): Promise<void> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }

    // Real API call for production
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        ...MOCK_TOKENS,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Refresh expiry
      };
    }

    // Real API call for production
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  static async getCurrentUser(accessToken: string): Promise<User> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 200));
      return MOCK_USER;
    }

    // Real API call for production
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  static async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    // Real API call for production
    const response = await fetch(`${API_BASE_URL}/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  static async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    if (IS_DEVELOPMENT) {
      // Mock implementation for development
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    }

    // Real API call for production
    const response = await fetch(`${API_BASE_URL}/password-reset/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset confirmation failed');
    }
  }
}