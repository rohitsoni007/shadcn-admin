export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { w: number; h: number };
  props: Record<string, any>;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

export type WidgetType = 'stats' | 'chart' | 'table' | 'custom';

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
  cols: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
}

export interface GridBreakpoint {
  breakpoint: string;
  cols: number;
  width: number;
}

export interface DashboardGridProps {
  widgets: WidgetConfig[];
  onLayoutChange?: (layout: WidgetConfig[]) => void;
  editable?: boolean;
  className?: string;
}

export interface BaseWidgetProps {
  id: string;
  title: string;
  loading?: boolean;
  error?: string | null;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export interface StatsWidgetProps extends BaseWidgetProps {
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ReactNode;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ChartWidgetProps extends BaseWidgetProps {
  data: ChartData[];
  type: 'line' | 'bar' | 'pie' | 'area';
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
}