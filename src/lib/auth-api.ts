import { LoginCredentials, AuthTokens, User, PasswordResetRequest } from '@/types/auth';

// Mock API endpoints - replace with actual API calls
const API_BASE_URL = '/api/auth';

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Mock implementation - replace with actual API call
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
    // Mock implementation - replace with actual API call
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Mock implementation - replace with actual API call
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
    // Mock implementation - replace with actual API call
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
    // Mock implementation - replace with actual API call
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
    // Mock implementation - replace with actual API call
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