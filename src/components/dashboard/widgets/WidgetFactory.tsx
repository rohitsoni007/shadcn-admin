import React from 'react';
import type { WidgetConfig } from '@/types/dashboard';
import { withLazyLoading, LoadingFallback } from '@/lib/lazy-loading';
import { BaseWidget } from './BaseWidget';

// Lazy load heavy widgets
const LazyStatsWidget = withLazyLoading(
  () => import('./StatsWidget').then(module => ({ default: module.StatsWidget })),
  <LoadingFallback message="Loading stats widget..." />
);

const LazyChartWidget = withLazyLoading(
  () => import('./ChartWidget').then(module => ({ default: module.ChartWidget })),
  <LoadingFallback message="Loading chart widget..." />
);

interface WidgetFactoryProps {
  widget: WidgetConfig;
  onRemove?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
  showDragHandle?: boolean;
  showActions?: boolean;
}

export const WidgetFactory: React.FC<WidgetFactoryProps> = ({
  widget,
  onRemove,
  onRefresh,
  showDragHandle = true,
  showActions = true,
}) => {
  const handleRemove = () => {
    onRemove?.(widget.id);
  };

  const handleRefresh = () => {
    onRefresh?.(widget.id);
  };

  const commonProps = {
    id: widget.id,
    onRemove: handleRemove,
    onRefresh: handleRefresh,
    showDragHandle,
    showActions,
  };

  switch (widget.type) {
    case 'stats':
      return (
        <LazyStatsWidget
          {...commonProps}
          title={widget.props.title || 'Stats Widget'}
          value={widget.props.value || 0}
          change={widget.props.change}
          trend={widget.props.trend}
          format={widget.props.format}
          icon={widget.props.icon}
          loading={widget.props.loading}
          error={widget.props.error}
        />
      );

    case 'chart':
      return (
        <LazyChartWidget
          {...commonProps}
          title={widget.props.title || 'Chart Widget'}
          data={widget.props.data || []}
          type={widget.props.type || 'line'}
          xAxisKey={widget.props.xAxisKey}
          yAxisKey={widget.props.yAxisKey}
          colors={widget.props.colors}
          showLegend={widget.props.showLegend}
          showTooltip={widget.props.showTooltip}
          loading={widget.props.loading}
          error={widget.props.error}
        />
      );

    case 'table':
      return (
        <BaseWidget
          {...commonProps}
          title={widget.props.title || 'Table Widget'}
          loading={widget.props.loading}
          error={widget.props.error}
        >
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Table widget coming soon...
          </div>
        </BaseWidget>
      );

    case 'custom':
      return (
        <BaseWidget
          {...commonProps}
          title={widget.props.title || 'Custom Widget'}
          loading={widget.props.loading}
          error={widget.props.error}
        >
          {widget.props.children || (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Custom widget content
            </div>
          )}
        </BaseWidget>
      );

    default:
      return (
        <BaseWidget
          {...commonProps}
          title="Unknown Widget"
          error="Unknown widget type"
        >
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Unknown widget type: {widget.type}
          </div>
        </BaseWidget>
      );
  }
};

export default WidgetFactory;