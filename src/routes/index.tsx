import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Edit, Plus, RotateCcw } from 'lucide-react';
import { DashboardGrid, WidgetFactory } from '@/components/dashboard';
import { useDashboardLayout } from '@/hooks/use-dashboard-layout';
import type { WidgetConfig } from '@/types/dashboard';

export const Route = createFileRoute('/')({
  component: Index,
});

// Sample data for demonstration
const sampleChartData = [
  { name: 'Jan', value: 400, revenue: 2400 },
  { name: 'Feb', value: 300, revenue: 1398 },
  { name: 'Mar', value: 200, revenue: 9800 },
  { name: 'Apr', value: 278, revenue: 3908 },
  { name: 'May', value: 189, revenue: 4800 },
  { name: 'Jun', value: 239, revenue: 3800 },
];

const initialWidgets: WidgetConfig[] = [
  {
    id: 'stats-users',
    type: 'stats',
    position: { x: 0, y: 0 },
    size: { w: 3, h: 2 },
    props: {
      title: 'Total Users',
      value: 1234,
      change: 20.1,
      trend: 'up',
      format: 'number',
    },
  },
  {
    id: 'stats-revenue',
    type: 'stats',
    position: { x: 3, y: 0 },
    size: { w: 3, h: 2 },
    props: {
      title: 'Revenue',
      value: 45231,
      change: 12.5,
      trend: 'up',
      format: 'currency',
    },
  },
  {
    id: 'stats-orders',
    type: 'stats',
    position: { x: 6, y: 0 },
    size: { w: 3, h: 2 },
    props: {
      title: 'Orders',
      value: 573,
      change: 8.2,
      trend: 'up',
      format: 'number',
    },
  },
  {
    id: 'stats-sessions',
    type: 'stats',
    position: { x: 9, y: 0 },
    size: { w: 3, h: 2 },
    props: {
      title: 'Active Sessions',
      value: 89,
      change: 4.3,
      trend: 'up',
      format: 'number',
    },
  },
  {
    id: 'chart-revenue',
    type: 'chart',
    position: { x: 0, y: 2 },
    size: { w: 6, h: 4 },
    props: {
      title: 'Revenue Trend',
      data: sampleChartData,
      type: 'line',
      xAxisKey: 'name',
      yAxisKey: 'revenue',
    },
  },
  {
    id: 'chart-users',
    type: 'chart',
    position: { x: 6, y: 2 },
    size: { w: 6, h: 4 },
    props: {
      title: 'User Growth',
      data: sampleChartData,
      type: 'bar',
      xAxisKey: 'name',
      yAxisKey: 'value',
    },
  },
];

function Index() {
  const {
    widgets,
    isEditing,
    updateLayout,
    addWidget,
    removeWidget,
    resetLayout,
    toggleEditMode,
  } = useDashboardLayout({
    initialWidgets,
    layoutId: 'main-dashboard',
    autoSave: true,
  });

  const handleAddWidget = () => {
    const newWidget: Omit<WidgetConfig, 'id'> = {
      type: 'stats',
      position: { x: 0, y: 0 },
      size: { w: 3, h: 2 },
      props: {
        title: 'New Widget',
        value: 0,
        format: 'number',
      },
    };
    addWidget(newWidget);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here you can view key metrics and manage your system.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddWidget}
            disabled={!isEditing}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetLayout}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={toggleEditMode}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Done' : 'Edit'}
          </Button>
        </div>
      </div>

      <DashboardGrid
        widgets={widgets}
        onLayoutChange={updateLayout}
        editable={isEditing}
        className="min-h-[600px]"
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <WidgetFactory
              widget={widget}
              onRemove={removeWidget}
              showDragHandle={isEditing}
              showActions={isEditing}
            />
          </div>
        ))}
      </DashboardGrid>
    </div>
  );
}