import React from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  Search,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuth } from '@/hooks/use-auth'
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

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'

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

// Get user initials from name
const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}



export function AppHeader({ breadcrumbs, actions, className }: AppHeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { logout, user } = useAuth()

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



  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/login' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme as typeof themes[number])
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  return (
    <div className={`sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
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
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search pages, users, settings..."
                className="w-full h-9 pl-8 pr-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                aria-label="Search (disabled)"
              />
            </div>
          </div>
        )}

        {/* Actions and user menu */}
        <div className="flex items-center gap-1 md:gap-2" role="toolbar" aria-label="Header actions">
          {/* Custom actions */}
          {actions}

          {/* Search button for mobile */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              aria-label="Search (disabled)"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {/* Notifications */}
          <NotificationPanel
            open={notificationsOpen}
            onOpenChange={setNotificationsOpen}
          />

          {/* Theme toggle - hidden on mobile to save space */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleTheme}
              aria-label={`Current theme: ${theme || 'system'}. Click to cycle themes`}
            >
              {theme === 'light' && <Sun className="h-4 w-4" />}
              {theme === 'dark' && <Moon className="h-4 w-4" />}
              {(theme === 'system' || !theme) && <Monitor className="h-4 w-4" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
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
                aria-label={`User menu for ${user?.name || 'User'}`}
              >
                <Avatar className={isMobile ? "h-9 w-9" : "h-8 w-8"}>
                  <AvatarImage src={user?.avatar} alt={`${user?.name || 'User'}'s avatar`} />
                  <AvatarFallback>{user?.name ? getUserInitials(user.name) : 'U'}</AvatarFallback>
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
                  <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/account" aria-label="View account">
                  <User className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>

              {/* Theme toggle for mobile users */}
              {isMobile && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={cycleTheme}
                    aria-label={`Current theme: ${theme || 'system'}. Click to cycle themes`}
                  >
                    {theme === 'light' && <Sun className="mr-2 h-4 w-4" />}
                    {theme === 'dark' && <Moon className="mr-2 h-4 w-4" />}
                    {(theme === 'system' || !theme) && <Monitor className="mr-2 h-4 w-4" />}
                    <span>
                      {theme === 'light' && 'Light Theme'}
                      {theme === 'dark' && 'Dark Theme'}
                      {(theme === 'system' || !theme) && 'System Theme'}
                    </span>
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


    </div>
  )
}