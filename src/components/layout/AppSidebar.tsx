import React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  Search,
  Home,
  BarChart3,
  FileText,
  Shield,
  Bell,
  HelpCircle,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    children: [
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        path: '/dashboard/analytics',
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: FileText,
        path: '/dashboard/reports',
      },
    ],
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
    children: [
      {
        id: 'general',
        label: 'General',
        icon: Settings,
        path: '/settings/general',
      },
      {
        id: 'security',
        label: 'Security',
        icon: Shield,
        path: '/settings/security',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        path: '/settings/notifications',
      },
    ],
  },
]

interface AppSidebarProps {
  className?: string
}

export function AppSidebar({ className }: AppSidebarProps) {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = React.useState('')

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

  const filteredMenuItems = React.useMemo(() => {
    if (!searchQuery) return menuItems
    
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((acc, item) => {
        const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase())
        const filteredChildren = item.children ? filterItems(item.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children,
          })
        }
        
        return acc
      }, [] as MenuItem[])
    }
    
    return filterItems(menuItems)
  }, [searchQuery])

  const renderMenuItem = (item: MenuItem) => {
    const isActive = isActiveRoute(item.path)
    const hasChildren = item.children && item.children.length > 0
    const hasActiveChildren = hasActiveChild(item)

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          defaultOpen={hasActiveChildren}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={hasActiveChildren}
                className="w-full"
                role="menuitem"
                aria-expanded={hasActiveChildren}
                aria-haspopup="true"
                aria-label={`${item.label}${item.badge ? ` (${item.badge} items)` : ''}, expandable menu`}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && (
                  <span 
                    className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                    aria-label={`${item.badge} items`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight 
                  className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" 
                  aria-hidden="true"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub role="menu" aria-label={`${item.label} submenu`}>
                {item.children?.map((child) => (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActiveRoute(child.path)}
                    >
                      <Link 
                        to={child.path || '#'}
                        role="menuitem"
                        aria-label={`${child.label}${child.badge ? ` (${child.badge} items)` : ''}`}
                        aria-current={isActiveRoute(child.path) ? 'page' : undefined}
                      >
                        <child.icon className="h-4 w-4" aria-hidden="true" />
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
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          asChild
          tooltip={item.label}
          isActive={isActive}
        >
          <Link 
            to={item.path || '#'}
            role="menuitem"
            aria-label={`${item.label}${item.badge ? ` (${item.badge} items)` : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            <span>{item.label}</span>
            {item.badge && (
              <span 
                className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground"
                aria-label={`${item.badge} items`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar variant="inset" className={className}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            role="img"
            aria-label={`${APP_NAME} logo`}
          >
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{APP_NAME}</span>
            <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
        <div className="px-2">
          <div className="relative">
            <Search 
              className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" 
              aria-hidden="true"
            />
            <SidebarInput
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              aria-label="Search navigation menu"
              role="searchbox"
            />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel id="navigation-group">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu role="menu" aria-labelledby="navigation-group">
              {filteredMenuItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel id="support-group">Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu role="menu" aria-labelledby="support-group">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  tooltip="Help & Support"
                  role="menuitem"
                  aria-label="Open help and support"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  <span>Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-muted-foreground">
          © 2024 {APP_NAME}
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}