import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  ChevronRight,
  Home,
  Lock,
  LogIn,
  UserPlus,
  KeyRound,
  RotateCcw,
} from 'lucide-react'
import { useSidebar } from '@/components/ui/sidebar'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { APP_NAME } from '@/lib/constants'

export interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path?: string
  children?: MenuItem[]
  badge?: string | number
}

const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    badge: '12',
  },
  {
    id: 'authentication',
    label: 'Authentication',
    icon: Lock,
    children: [
      {
        id: 'login',
        label: 'Login',
        icon: LogIn,
        path: '/login',
      },
      {
        id: 'register',
        label: 'Register',
        icon: UserPlus,
        path: '/register',
      },
      {
        id: 'forgot-password',
        label: 'Forgot Password',
        icon: KeyRound,
        path: '/forgot-password',
      },
      {
        id: 'reset-password',
        label: 'Reset Password',
        icon: RotateCcw,
        path: '/password-reset?token=123',
      },
    ],
  },

]

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation()
  const { open, state } = useSidebar()

  const isActiveRoute = (path?: string) => {
    if (!path) return false
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const hasActiveChild = (item: MenuItem): boolean => {
    if (!item.children) return false
    return item.children.some(child =>
      isActiveRoute(child.path) || hasActiveChild(child)
    )
  }



  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item.path)
    const hasChildren = item.children && item.children.length > 0
    const hasActiveChildren = hasActiveChild(item)

    // When collapsed, don't show items with children (too complex for icon-only mode)
    if (hasChildren && !open) {
      return (
        <Link
          key={item.id}
          to={item.path || '#'}
          className={cn(
            "flex items-center w-full text-sm rounded-md transition-colors p-2 justify-center",
            hasActiveChildren
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent"
          )}
          role="menuitem"
          aria-label={item.label}
          title={item.label}
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
        </Link>
      )
    }

    if (hasChildren && open) {
      return (
        <Collapsible
          key={item.id}
          defaultOpen={hasActiveChildren}
          className="group/collapsible"
        >
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors",
                hasActiveChildren
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent"
              )}
              role="menuitem"
              aria-expanded={hasActiveChildren}
              aria-haspopup="true"
              aria-label={`${item.label}${item.badge ? ` (${item.badge} items)` : ''}, expandable menu`}
            >
              <item.icon className="h-4 w-4 mr-3" aria-hidden="true" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span
                  className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                  aria-label={`${item.badge} items`}
                >
                  {item.badge}
                </span>
              )}
              <ChevronRight
                className="ml-2 h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                aria-hidden="true"
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="ml-6 mt-1 space-y-1" role="menu" aria-label={`${item.label} submenu`}>
              {item.children?.map((child) => (
                <Link
                  key={child.id}
                  to={child.path || '#'}
                  target={item.id === 'authentication' ? '_blank' : undefined}
                  rel={item.id === 'authentication' ? 'noopener noreferrer' : undefined}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                    isActiveRoute(child.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent"
                  )}
                  role="menuitem"
                  aria-label={`${child.label}${child.badge ? ` (${child.badge} items)` : ''}`}
                  aria-current={isActiveRoute(child.path) ? 'page' : undefined}
                >
                  <child.icon className="h-4 w-4 mr-3" aria-hidden="true" />
                  <span>{child.label}</span>
                  {child.badge && (
                    <span
                      className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                      aria-label={`${child.badge} items`}
                    >
                      {child.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        key={item.id}
        to={item.path || '#'}
        className={cn(
          "flex items-center text-sm rounded-md transition-colors",
          open ? "px-3 py-2" : "p-2 justify-center",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent"
        )}
        role="menuitem"
        aria-label={`${item.label}${item.badge ? ` (${item.badge} items)` : ''}`}
        aria-current={isActive ? 'page' : undefined}
        title={!open ? item.label : undefined}
      >
        <item.icon className={cn("h-4 w-4", open ? "mr-3" : "")} aria-hidden="true" />
        {open && <span>{item.label}</span>}
        {open && item.badge && (
          <span
            className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
            aria-label={`${item.badge} items`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-200',
        open ? 'w-64' : 'w-16',
        className
      )}
      data-state={state}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className={cn("border-sidebar-border", open ? "p-4" : "p-2")}>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              role="img"
              aria-label={`${APP_NAME} logo`}
            >
              <LayoutDashboard className="h-4 w-4" />
            </div>
            {open && (
              <div className="grid flex-1 text-left text-md leading-tight">
                <span className="truncate font-semibold">{APP_NAME}</span>
              </div>
            )}
          </div>

        </div>

        {/* Content */}
        <div className={cn("flex-1 overflow-y-auto", open ? "p-4" : "p-2")}>
          <nav className="space-y-1" role="menu">
            {menuItems.map(renderMenuItem)}


          </nav>
        </div>

        {/* Footer */}
        {open && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground">
              © 2024 {APP_NAME}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}