import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MoreHorizontal, GripVertical, X, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BaseWidgetProps } from '@/types/dashboard';

interface ExtendedBaseWidgetProps extends BaseWidgetProps {
  onRemove?: () => void;
  onRefresh?: () => void;
  showDragHandle?: boolean;
  showActions?: boolean;
}

export const BaseWidget: React.FC<ExtendedBaseWidgetProps> = ({
  title,
  loading = false,
  error = null,
  actions,
  className,
  children,
  onRemove,
  onRefresh,
  showDragHandle = true,
  showActions = true,
}) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    return children;
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          {showDragHandle && (
            <div className="widget-drag-handle cursor-move opacity-50 hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        
        <div className="flex items-center space-x-1">
          {actions}
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onRefresh && (
                  <DropdownMenuItem onClick={onRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </DropdownMenuItem>
                )}
                {onRemove && (
                  <DropdownMenuItem onClick={onRemove} className="text-destructive">
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default BaseWidget;