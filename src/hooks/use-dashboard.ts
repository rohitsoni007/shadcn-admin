import { useApiQuery } from './use-api'

// Dashboard data types
export interface DashboardMetric {
  id: string
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

export interface DashboardChart {
  id: string
  title: string
  type: 'line' | 'bar' | 'pie' | 'area'
  data: ChartDataPoint[]
}

export interface Activity {
  id: string
  type: string
  message: string
  user: string
  timestamp: string
}

export interface DashboardData {
  metrics: DashboardMetric[]
  charts: DashboardChart[]
  recentActivity: Activity[]
}

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  charts: () => [...dashboardKeys.all, 'charts'] as const,
  activity: () => [...dashboardKeys.all, 'activity'] as const,
}

// Hooks
export function useDashboardOverview() {
  return useApiQuery<DashboardData>(
    dashboardKeys.overview(),
    '/dashboard/overview',
    undefined,
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    }
  )
}

export function useDashboardMetrics() {
  return useApiQuery<DashboardMetric[]>(
    dashboardKeys.metrics(),
    '/dashboard/metrics',
    undefined,
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    }
  )
}

export function useDashboardCharts() {
  return useApiQuery<DashboardChart[]>(
    dashboardKeys.charts(),
    '/dashboard/charts',
    undefined,
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    }
  )
}

export function useRecentActivity() {
  return useApiQuery<Activity[]>(
    dashboardKeys.activity(),
    '/dashboard/activity',
    undefined,
    {
      staleTime: 1000 * 60 * 1, // 1 minute
      refetchInterval: 1000 * 60 * 2, // Refetch every 2 minutes
    }
  )
}