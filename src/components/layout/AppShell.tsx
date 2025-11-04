import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SkipLink } from '@/components/ui/skip-link'
import { useScreenReaderAnnouncement } from '@/components/ui/screen-reader-announcement'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
  className?: string
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
      
      <div className={cn('flex min-h-screen w-full', className)}>
        {/* Navigation landmark */}
        <nav 
          id="sidebar-navigation" 
          aria-label="Main navigation"
          role="navigation"
        >
          {sidebar}
        </nav>
        
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header landmark */}
          <header role="banner" aria-label="Page header">
            {header}
          </header>
          
          {/* Main content landmark */}
          <main 
            id="main-content"
            className="flex-1 p-4 md:p-6"
            role="main"
            aria-label="Main content"
            tabIndex={-1}
          >
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}