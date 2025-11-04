import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { AppShell } from '../AppShell'

// Mock the UI components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  SidebarInset: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>
}))

vi.mock('@/components/ui/skip-link', () => ({
  SkipLink: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}))

vi.mock('@/components/ui/screen-reader-announcement', () => ({
  useScreenReaderAnnouncement: () => ({
    AnnouncementComponent: () => <div data-testid="announcement" />
  })
}))

describe('AppShell', () => {
  it('renders main content', () => {
    render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with proper semantic structure', () => {
    render(
      <AppShell 
        sidebar={<div>Sidebar</div>}
        header={<div>Header</div>}
      >
        <div>Main Content</div>
      </AppShell>
    )
    
    // Check for proper landmarks
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('banner', { name: /page header/i })).toBeInTheDocument()
    expect(screen.getByRole('main', { name: /main content/i })).toBeInTheDocument()
  })

  it('includes skip links for accessibility', () => {
    render(<AppShell><div>Content</div></AppShell>)
    
    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to navigation')).toBeInTheDocument()
  })

  it('renders sidebar and header when provided', () => {
    render(
      <AppShell 
        sidebar={<div data-testid="sidebar">Sidebar Content</div>}
        header={<div data-testid="header">Header Content</div>}
      >
        <div>Main Content</div>
      </AppShell>
    )
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })
})