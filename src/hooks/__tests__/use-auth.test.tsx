import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStatus, usePermissions } from '../use-auth'
import React from 'react'

// Mock the auth context
const mockAuthContext = {
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: {
      id: 'admin',
      name: 'Administrator',
      permissions: ['read', 'write', 'delete']
    }
  },
  hasPermission: vi.fn((permission: string) => ['read', 'write', 'delete'].includes(permission)),
  hasRole: vi.fn((role: string) => role === 'Administrator'),
  login: vi.fn(),
  logout: vi.fn(),
  refreshAuth: vi.fn()
}

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockAuthContext
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuthStatus', () => {
  it('returns authentication status', () => {
    const { result } = renderHook(() => useAuthStatus(), {
      wrapper: createWrapper()
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual(mockAuthContext.user)
  })
})

describe('usePermissions', () => {
  it('returns user permissions and role', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper()
    })
    
    expect(result.current.permissions).toEqual(['read', 'write', 'delete'])
    expect(result.current.role).toEqual(mockAuthContext.user.role)
  })

  it('checks permissions correctly', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: createWrapper()
    })
    
    expect(result.current.hasPermission('read')).toBe(true)
    expect(result.current.hasPermission('invalid')).toBe(false)
  })
})