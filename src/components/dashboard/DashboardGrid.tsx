import React, { useState, useCallback, useMemo } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import { cn } from '@/lib/utils';
import type { DashboardGridProps } from '@/types/dashboard';


const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridComponentProps extends DashboardGridProps {
  children?: React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridComponentProps> = ({
  widgets,
  onLayoutChange,
  editable = false,
  className,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Convert widgets to react-grid-layout format
  const layouts = useMemo(() => {
    const layout: Layout[] = widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.size.w,
      h: widget.size.h,
      minW: widget.minW || 1,
      minH: widget.minH || 1,
      maxW: widget.maxW || Infinity,
      maxH: widget.maxH || Infinity,
    }));

    return {
      lg: layout,
      md: layout,
      sm: layout,
      xs: layout,
    };
  }, [widgets]);

  // Handle layout changes
  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (!onLayoutChange || !editable) return;

      const updatedWidgets = widgets.map((widget) => {
        const layoutItem = layout.find((item) => item.i === widget.id);
        if (layoutItem) {
          return {
            ...widget,
            position: { x: layoutItem.x, y: layoutItem.y },
            size: { w: layoutItem.w, h: layoutItem.h },
          };
        }
        return widget;
      });

      onLayoutChange(updatedWidgets);
    },
    [widgets, onLayoutChange, editable]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragStop = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Responsive breakpoints
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4 };

  return (
    <div
      className={cn(
        'dashboard-grid',
        isDragging && 'dragging',
        className
      )}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={60}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={editable}
        isResizable={editable}
        onLayoutChange={handleLayoutChange}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStart={handleDragStart}
        onResizeStop={handleDragStop}
        draggableHandle=".widget-drag-handle"
        useCSSTransforms={true}
        preventCollision={false}
        compactType="vertical"
      >
        {children}
      </ResponsiveGridLayout>


    </div>
  );
};

export default DashboardGrid;