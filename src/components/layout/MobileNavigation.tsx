import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  Settings, 
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface MobileNavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: string | number
}

const mobileNavItems: MobileNavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    badge: '12',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
  },
]

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const location = useLocation()
  const isMobile = useIsMobile()
  const isTouchDevice = useTouchDevice()
  const [isOpen, setIsOpen] = React.useState(false)

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Don't render on desktop
  if (!isMobile) return null

  return (
    <div className={cn('md:hidden', className)}>
      {/* Mobile Navigation Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0"
          aria-label="Mobile navigation menu"
        >
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-left">Navigation</SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-8rem)] px-6">
            <nav 
              className="space-y-2"
              role="navigation"
              aria-label="Mobile navigation"
            >
              {mobileNavItems.map((item) => {
                const isActive = isActiveRoute(item.path)
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      // Larger touch targets for mobile
                      'min-h-[48px]',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={`Navigate to ${item.label}${item.badge ? ` (${item.badge} items)` : ''}`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span 
                        className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground"
                        aria-label={`${item.badge} items`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
            
            <Separator className="my-6" />
            
            {/* Additional mobile-specific actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-3">
                Quick Actions
              </h3>
              <Button
                variant="ghost"
                className="w-full justify-start h-12 px-3"
                onClick={() => setIsOpen(false)}
                aria-label="Search"
              >
                <span>Search</span>
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t md:hidden">
        <nav 
          className="flex items-center justify-around px-2 py-2"
          role="navigation"
          aria-label="Bottom navigation"
        >
          {mobileNavItems.slice(0, 4).map((item) => {
            const isActive = isActiveRoute(item.path)
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  // Larger touch targets
                  'min-h-[56px] min-w-[56px]',
                  isActive && 'text-primary'
                )}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
              >
                <div className="relative">
                  <item.icon 
                    className={cn(
                      'h-5 w-5',
                      isActive && 'text-primary'
                    )} 
                    aria-hidden="true"
                  />
                  {item.badge && (
                    <span 
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center"
                      aria-label={`${item.badge} notifications`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={cn(
                  'text-[10px] leading-none',
                  isActive && 'text-primary font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

/**
 * Hook to manage mobile navigation state
 */
export function useMobileNavigation() {
  const [isBottomNavVisible, setIsBottomNavVisible] = React.useState(true)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide bottom nav when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsBottomNavVisible(false)
      } else {
        setIsBottomNavVisible(true)
      }
      
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return {
    isBottomNavVisible,
    setIsBottomNavVisible
  }
}