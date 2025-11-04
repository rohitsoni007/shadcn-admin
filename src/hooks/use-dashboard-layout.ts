import { useState, useCallback, useEffect } from 'react';
import type { WidgetConfig, DashboardLayout } from '@/types/dashboard';

interface UseDashboardLayoutProps {
  initialWidgets?: WidgetConfig[];
  layoutId?: string;
  autoSave?: boolean;
}

export const useDashboardLayout = ({
  initialWidgets = [],
  layoutId = 'default',
  autoSave = true,
}: UseDashboardLayoutProps = {}) => {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);
  const [isEditing, setIsEditing] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    if (autoSave) {
      const savedLayout = localStorage.getItem(`dashboard-layout-${layoutId}`);
      if (savedLayout) {
        try {
          const parsed = JSON.parse(savedLayout);
          setWidgets(parsed.widgets || initialWidgets);
        } catch (error) {
          console.error('Failed to parse saved layout:', error);
          setWidgets(initialWidgets);
        }
      }
    }
  }, [layoutId, autoSave, initialWidgets]);

  // Save layout to localStorage
  const saveLayout = useCallback(
    (widgetsToSave: WidgetConfig[]) => {
      if (autoSave) {
        const layout: DashboardLayout = {
          id: layoutId,
          name: `Layout ${layoutId}`,
          widgets: widgetsToSave,
          breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
          cols: { lg: 12, md: 10, sm: 6, xs: 4 },
        };
        localStorage.setItem(`dashboard-layout-${layoutId}`, JSON.stringify(layout));
      }
    },
    [layoutId, autoSave]
  );

  // Update widget positions and sizes
  const updateLayout = useCallback(
    (updatedWidgets: WidgetConfig[]) => {
      setWidgets(updatedWidgets);
      saveLayout(updatedWidgets);
    },
    [saveLayout]
  );

  // Add a new widget
  const addWidget = useCallback(
    (widget: Omit<WidgetConfig, 'id'>) => {
      const newWidget: WidgetConfig = {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updatedWidgets = [...widgets, newWidget];
      setWidgets(updatedWidgets);
      saveLayout(updatedWidgets);
      return newWidget.id;
    },
    [widgets, saveLayout]
  );

  // Remove a widget
  const removeWidget = useCallback(
    (widgetId: string) => {
      const updatedWidgets = widgets.filter((w) => w.id !== widgetId);
      setWidgets(updatedWidgets);
      saveLayout(updatedWidgets);
    },
    [widgets, saveLayout]
  );

  // Update widget props
  const updateWidget = useCallback(
    (widgetId: string, updates: Partial<WidgetConfig>) => {
      const updatedWidgets = widgets.map((w) =>
        w.id === widgetId ? { ...w, ...updates } : w
      );
      setWidgets(updatedWidgets);
      saveLayout(updatedWidgets);
    },
    [widgets, saveLayout]
  );

  // Reset layout to initial state
  const resetLayout = useCallback(() => {
    setWidgets(initialWidgets);
    if (autoSave) {
      localStorage.removeItem(`dashboard-layout-${layoutId}`);
    }
  }, [initialWidgets, layoutId, autoSave]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  return {
    widgets,
    isEditing,
    updateLayout,
    addWidget,
    removeWidget,
    updateWidget,
    resetLayout,
    toggleEditMode,
    setIsEditing,
  };
};