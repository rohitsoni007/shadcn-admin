import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ThemeProvider } from 'next-themes'
import { AppShell, AppSidebar, AppHeader, MobileNavigation } from '@/components/layout'
import { AuthRouteWrapper, SessionTimeout } from '@/components/auth'
import { Toaster } from '@/components/ui/toaster'
import { useIsMobile } from '@/hooks/use-mobile'

function RootComponent() {
  const isMobile = useIsMobile()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthRouteWrapper>
        <AppShell
          sidebar={!isMobile ? <AppSidebar /> : undefined}
          header={<AppHeader />}
        >
          <Outlet />
        </AppShell>
        
        {/* Mobile Navigation */}
        <MobileNavigation />
        
        {/* Session Management */}
        <SessionTimeout warningTime={5} sessionTimeout={30} />
      </AuthRouteWrapper>
      
      {/* Toast Notifications */}
      <Toaster />
      
      {/* Development Tools */}
      <TanStackRouterDevtools />
    </ThemeProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})