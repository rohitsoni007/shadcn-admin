import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { ThemeToggle } from '../theme-toggle'

// Mock the theme provider
const mockSetTheme = vi.fn()
vi.mock('../theme-provider', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light'
  })
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it('renders theme toggle button', () => {
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<ThemeToggle />)
    
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-haspopup', 'menu')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('contains theme icons', () => {
    render(<ThemeToggle />)
    
    // Check for sun and moon icons (they should be present in the DOM)
    const sunIcon = document.querySelector('.lucide-sun')
    const moonIcon = document.querySelector('.lucide-moon')
    
    expect(sunIcon).toBeInTheDocument()
    expect(moonIcon).toBeInTheDocument()
  })
})