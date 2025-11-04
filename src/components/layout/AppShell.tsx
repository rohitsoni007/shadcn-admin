import React from 'react'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { SkipLink } from '@/components/ui/skip-link'
import { useScreenReaderAnnouncement } from '@/components/ui/screen-reader-announcement'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
}

function AppShellContent({ children, sidebar, header, className }: AppShellProps) {
  const { open } = useSidebar()
  const isMobile = useIsMobile()

  return (
    <div className={cn('flex min-h-screen w-full', className)}>
      {/* Sidebar */}
      {!isMobile && sidebar}
      
      {/* Main content area */}
      <div 
        className={cn(
          'flex flex-1 flex-col transition-all duration-200',
          !isMobile && open ? 'ml-64' : !isMobile ? 'ml-16' : 'ml-0'
        )}
      >
        {/* Header */}
        <header role="banner" aria-label="Page header" className="sticky top-0 z-40">
          {header}
        </header>
        
        {/* Main content */}
        <main 
          id="main-content"
          className="flex-1 p-4 md:p-6"
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobile && sidebar}
    </div>
  )
}

export function AppShell({ children, sidebar, header, className }: AppShellProps) {
  const { AnnouncementComponent } = useScreenReaderAnnouncement()

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Skip links for keyboard navigation */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#sidebar-navigation">Skip to navigation</SkipLink>
      
      {/* Screen reader announcements */}
      <AnnouncementComponent />
      
      <AppShellContent 
        sidebar={sidebar}
        header={header}
        className={className}
      >
        {children}
      </AppShellContent>
    </SidebarProvider>
  )
}