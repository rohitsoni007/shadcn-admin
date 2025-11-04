import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StatsWidgetProps } from '@/types/dashboard';
import { BaseWidget } from './BaseWidget';

interface ExtendedStatsWidgetProps extends StatsWidgetProps {
  onRemove?: () => void;
  onRefresh?: () => void;
  showDragHandle?: boolean;
  showActions?: boolean;
}

export const StatsWidget: React.FC<ExtendedStatsWidgetProps> = ({
  id,
  title,
  value,
  change,
  trend = 'neutral',
  format = 'number',
  icon,
  loading,
  error,
  actions,
  className,
  onRemove,
  onRefresh,
  showDragHandle = true,
  showActions = true,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const formatChange = (changeValue: number): string => {
    const sign = changeValue >= 0 ? '+' : '';
    return `${sign}${changeValue}%`;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <BaseWidget
      id={id}
      title={title}
      loading={loading}
      error={error}
      actions={actions}
      className={className}
      onRemove={onRemove}
      onRefresh={onRefresh}
      showDragHandle={showDragHandle}
      showActions={showActions}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-bold">{formatValue(value)}</div>
          {change !== undefined && (
            <div className={cn('flex items-center text-xs', getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">{formatChange(change)} from last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground opacity-50">
            {icon}
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default StatsWidget;