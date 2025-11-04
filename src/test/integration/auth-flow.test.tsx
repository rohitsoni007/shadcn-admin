import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the auth API
const mockAuthAPI = {
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
}

vi.mock('@/lib/auth-api', () => ({
  AuthAPI: mockAuthAPI
}))

// Simple login form component for testing
const LoginForm = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await mockAuthAPI.login({ email, password })
    } catch (err) {
      setError('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        data-testid="email-input"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        data-testid="password-input"
      />
      <button type="submit" disabled={isLoading} data-testid="submit-button">
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  )
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles successful login flow', async () => {
    mockAuthAPI.login.mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
      token: 'mock-token'
    })

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    // Fill in the form
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'password123' }
    })

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'))

    // Check loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument()

    // Wait for the API call to complete
    await waitFor(() => {
      expect(mockAuthAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('handles login failure', async () => {
    mockAuthAPI.login.mockRejectedValue(new Error('Invalid credentials'))

    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    // Fill in the form
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { value: 'wrongpassword' }
    })

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'))

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Login failed')
    })
  })

  it('validates form inputs', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    )

    const emailInput = screen.getByTestId('email-input')
    const passwordInput = screen.getByTestId('password-input')
    const submitButton = screen.getByTestId('submit-button')

    // Check initial state
    expect(emailInput).toHaveValue('')
    expect(passwordInput).toHaveValue('')
    expect(submitButton).toHaveTextContent('Login')

    // Test input changes
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})