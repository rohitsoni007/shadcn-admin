import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Monitor,
  Menu,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import { GlobalSearch, SearchTrigger } from '@/components/search'
import { NotificationPanel } from '@/components/notifications'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  path?: string
}

interface AppHeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

// Mock user data - in a real app this would come from auth context
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '',
  initials: 'JD',
}



export function AppHeader({ breadcrumbs, actions, className }: AppHeaderProps) {
  const location = useLocation()
  const { setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)
  const isMobile = useIsMobile()

  // Generate breadcrumbs from current route if not provided
  const generatedBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const items: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Capitalize and format segment
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      items.push({
        label,
        path: isLast ? undefined : currentPath
      })
    })

    return items
  }, [location.pathname, breadcrumbs])



  const handleLogout = () => {
    // Implement logout functionality
    console.log('Logout clicked')
  }

  return (
    <div className={`sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        {/* Sidebar trigger and breadcrumbs */}
        <div className="flex items-center gap-2 flex-1">
          <SidebarTrigger 
            className="-ml-1" 
            aria-label="Toggle navigation sidebar"
          />
          <Separator orientation="vertical" className="mr-2 h-4" />
          
          <nav aria-label="Breadcrumb navigation" className="hidden md:flex">
            <Breadcrumb>
              <BreadcrumbList>
                {generatedBreadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {item.path && index < generatedBreadcrumbs.length - 1 ? (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={item.path}
                            aria-label={`Navigate to ${item.label}`}
                          >
                            {item.label}
                          </Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage aria-current="page">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < generatedBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </nav>
        </div>

        {/* Search bar - hidden on mobile */}
        {!isMobile && (
          <div className="flex flex-1 justify-center max-w-sm mx-auto">
            <SearchTrigger
              onClick={() => setSearchOpen(true)}
              className="w-full"
              placeholder="Search pages, users, settings..."
              aria-label="Open search dialog"
            />
          </div>
        )}

        {/* Actions and user menu */}
        <div className="flex items-center gap-1 md:gap-2" role="toolbar" aria-label="Header actions">
          {/* Custom actions */}
          {actions}

          {/* Search button for mobile */}
          {isMobile && (
            <SearchTrigger
              variant="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search dialog"
              className="h-9 w-9"
            />
          )}

          {/* Notifications */}
          <NotificationPanel 
            open={notificationsOpen} 
            onOpenChange={setNotificationsOpen} 
          />

          {/* Theme toggle - hidden on mobile to save space */}
          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  aria-label="Toggle theme menu"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" aria-label="Theme options">
                <DropdownMenuItem 
                  onClick={() => setTheme('light')}
                  aria-label="Switch to light theme"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('dark')}
                  aria-label="Switch to dark theme"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setTheme('system')}
                  aria-label="Use system theme"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "relative rounded-full",
                  isMobile ? "h-9 w-9" : "h-8 w-8"
                )}
                aria-label={`User menu for ${mockUser.name}`}
              >
                <Avatar className={isMobile ? "h-9 w-9" : "h-8 w-8"}>
                  <AvatarImage src={mockUser.avatar} alt={`${mockUser.name}'s avatar`} />
                  <AvatarFallback>{mockUser.initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56" 
              align="end" 
              forceMount
              aria-label="User account menu"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{mockUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {mockUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem aria-label="View profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" aria-label="Open settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              {/* Theme toggle for mobile users */}
              {isMobile && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setTheme('light')}
                    aria-label="Switch to light theme"
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Theme</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTheme('dark')}
                    aria-label="Switch to dark theme"
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Theme</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                aria-label="Log out of account"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  )
}