import { AuthTokens, User } from '@/types/auth';

const AUTH_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

export class AuthStorage {
  static setTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  }

  static getTokens(): AuthTokens | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      
      const tokens = JSON.parse(stored) as AuthTokens;
      
      // Check if tokens are expired
      if (Date.now() >= tokens.expiresAt) {
        this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch (error) {
      console.error('Failed to retrieve auth tokens:', error);
      return null;
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  static setUser(user: User): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  static getUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (!stored) return null;
      
      const user = JSON.parse(stored) as User;
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt);
      if (user.lastLoginAt) {
        user.lastLoginAt = new Date(user.lastLoginAt);
      }
      
      return user;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  static clearUser(): void {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  static clearAll(): void {
    this.clearTokens();
    this.clearUser();
  }
}