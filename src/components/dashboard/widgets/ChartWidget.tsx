import React, { useMemo, useRef } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartWidgetProps } from '@/types/dashboard';
import { BaseWidget } from './BaseWidget';
import { ChartExportButton } from '@/components/data-export';

interface ExtendedChartWidgetProps extends ChartWidgetProps {
  onRemove?: () => void;
  onRefresh?: () => void;
  showDragHandle?: boolean;
  showActions?: boolean;
}

const DEFAULT_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const ChartWidget: React.FC<ExtendedChartWidgetProps> = ({
  id,
  title,
  data,
  type,
  xAxisKey = 'name',
  yAxisKey = 'value',
  colors = DEFAULT_COLORS,
  showLegend = true,
  showTooltip = true,
  loading,
  error,
  actions,
  className,
  onRemove,
  onRefresh,
  showDragHandle = true,
  showActions = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartColors = useMemo(() => colors.length > 0 ? colors : DEFAULT_COLORS, [colors]);

  // Enhanced actions with export functionality
  const enhancedActions = (
    <div className="flex items-center space-x-2">
      <ChartExportButton
        chartRef={chartRef}
        chartData={data}
        filename={`${title.toLowerCase().replace(/\s+/g, '-')}-chart`}
        size="sm"
      />
      {actions}
    </div>
  );

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={chartColors[0]}
              strokeWidth={2}
              dot={{ fill: chartColors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: chartColors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={chartColors[0]}
              fill={chartColors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            {showLegend && <Legend />}
            <Bar dataKey={yAxisKey} fill={chartColors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
            )}
            {showLegend && <Legend />}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={yAxisKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartColors[index % chartColors.length]} 
                />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <BaseWidget
      id={id}
      title={title}
      loading={loading}
      error={error}
      actions={enhancedActions}
      className={className}
      onRemove={onRemove}
      onRefresh={onRefresh}
      showDragHandle={showDragHandle}
      showActions={showActions}
    >
      <div ref={chartRef} className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </BaseWidget>
  );
};

export default ChartWidget;