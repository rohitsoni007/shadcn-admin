import React from 'react'
import { cn } from '@/lib/utils'
import { useIsMobile, useTouchDevice } from '@/hooks/use-mobile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronRight, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface MobileDataTableColumn<T> {
  key: keyof T
  label: string
  render?: (value: any, item: T) => React.ReactNode
  primary?: boolean
  secondary?: boolean
  badge?: boolean
}

interface MobileDataTableAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
}

interface MobileDataTableProps<T> {
  data: T[]
  columns: MobileDataTableColumn<T>[]
  actions?: MobileDataTableAction<T>[]
  onItemClick?: (item: T) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
}

/**
 * Mobile-optimized data table that displays data as cards on mobile devices
 */
export function MobileDataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  onItemClick,
  loading = false,
  emptyMessage = 'No data available',
  className
}: MobileDataTableProps<T>) {
  const isMobile = useIsMobile()
  const isTouchDevice = useTouchDevice()

  const primaryColumn = columns.find(col => col.primary)
  const secondaryColumns = columns.filter(col => col.secondary)
  const badgeColumns = columns.filter(col => col.badge)
  const otherColumns = columns.filter(col => !col.primary && !col.secondary && !col.badge)

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item, index) => (
        <Card 
          key={index}
          className={cn(
            'transition-all duration-200',
            onItemClick && 'cursor-pointer hover:shadow-md',
            isTouchDevice && 'active:scale-[0.98]'
          )}
          onClick={() => onItemClick?.(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Main content */}
              <div className="flex-1 min-w-0">
                {/* Primary information */}
                {primaryColumn && (
                  <div className="font-medium text-foreground mb-1 truncate">
                    {primaryColumn.render 
                      ? primaryColumn.render(item[primaryColumn.key], item)
                      : String(item[primaryColumn.key])
                    }
                  </div>
                )}

                {/* Secondary information */}
                {secondaryColumns.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {secondaryColumns.map((column) => (
                      <div key={String(column.key)} className="text-sm text-muted-foreground truncate">
                        <span className="font-medium">{column.label}:</span>{' '}
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key])
                        }
                      </div>
                    ))}
                  </div>
                )}

                {/* Badges */}
                {badgeColumns.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {badgeColumns.map((column) => (
                      <Badge key={String(column.key)} variant="secondary" className="text-xs">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key])
                        }
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Other columns in collapsed view */}
                {otherColumns.length > 0 && (
                  <details className="group">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      <span className="inline-flex items-center gap-1">
                        Show more details
                        <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                      </span>
                    </summary>
                    <div className="mt-2 pt-2 border-t space-y-1">
                      {otherColumns.map((column) => (
                        <div key={String(column.key)} className="text-xs text-muted-foreground">
                          <span className="font-medium">{column.label}:</span>{' '}
                          {column.render 
                            ? column.render(item[column.key], item)
                            : String(item[column.key])
                          }
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="flex-shrink-0">
                  {actions.length === 1 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        actions[0].onClick(item)
                      }}
                      className="h-8 w-8 p-0"
                      aria-label={actions[0].label}
                    >
                      {actions[0].icon ? (
                        <actions[0].icon className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Open actions menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {actions.map((action, actionIndex) => (
                          <DropdownMenuItem
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            className={cn(
                              action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                            )}
                          >
                            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                            {action.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Hook to determine if mobile table should be used
 */
export function useMobileTable() {
  const isMobile = useIsMobile()
  const [forceMobile, setForceMobile] = React.useState(false)

  return {
    shouldUseMobileTable: isMobile || forceMobile,
    setForceMobile
  }
}