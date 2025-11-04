import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AppShell, AppSidebar, AppHeader, MobileNavigation } from '@/components/layout'
import { AuthRouteWrapper, SessionTimeout } from '@/components/auth'
import { Toaster } from '@/components/ui/toaster'
import { useIsMobile } from '@/hooks/use-mobile'

function RootComponent() {
  const isMobile = useIsMobile()
  const location = useLocation()

  // Define authentication routes that should not have layout
  const authRoutes = ['/login', '/register', '/forgot-password', '/password-reset']
  const isAuthRoute = authRoutes.includes(location.pathname)

  return (
    <AuthRouteWrapper>
      {isAuthRoute ? (
        <Outlet />
      ) : (
        <>
          <AppShell
            sidebar={!isMobile ? <AppSidebar /> : undefined}
            header={<AppHeader />}
          >
            <Outlet />
          </AppShell>

          <MobileNavigation />

          <SessionTimeout warningTime={5} sessionTimeout={30} />
        </>
      )}

      <Toaster />

      {/* <TanStackRouterDevtools /> */}
    </AuthRouteWrapper>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})