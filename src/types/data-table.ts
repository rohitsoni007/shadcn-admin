import { ReactNode } from 'react'

// Column definition
export interface ColumnDef<T = any> {
  id: string
  header: string | ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (props: { row: T; value: any }) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  sticky?: 'left' | 'right'
}

// Sorting configuration
export interface SortingState {
  id: string
  desc: boolean
}

// Filtering configuration
export interface ColumnFilter {
  id: string
  value: any
}

export interface FilteringState {
  columnFilters: ColumnFilter[]
  globalFilter?: string
}

// Pagination configuration
export interface PaginationState {
  pageIndex: number
  pageSize: number
}

// Selection configuration
export interface SelectionState {
  selectedRows: Set<string>
  isAllSelected: boolean
  isIndeterminate: boolean
}

// Table action
export interface TableAction<T = any> {
  id: string
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  disabled?: (row: T) => boolean
  hidden?: (row: T) => boolean
}

// Bulk action
export interface BulkAction<T = any> {
  id: string
  label: string
  icon?: ReactNode
  onClick: (selectedRows: T[]) => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  disabled?: (selectedRows: T[]) => boolean
}

// Data table configuration
export interface DataTableConfig<T = any> {
  data: T[]
  columns: ColumnDef<T>[]
  
  // Pagination
  pagination?: {
    enabled: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    showPageSizeSelector?: boolean
  }
  
  // Sorting
  sorting?: {
    enabled: boolean
    multiple?: boolean
  }
  
  // Filtering
  filtering?: {
    enabled: boolean
    globalSearch?: boolean
    columnFilters?: boolean
  }
  
  // Selection
  selection?: {
    enabled: boolean
    multiple?: boolean
    rowId?: keyof T | ((row: T) => string)
  }
  
  // Actions
  actions?: TableAction<T>[]
  bulkActions?: BulkAction<T>[]
  
  // Loading and empty states
  loading?: boolean
  error?: Error | null
  emptyMessage?: string
  
  // Styling
  striped?: boolean
  bordered?: boolean
  compact?: boolean
  stickyHeader?: boolean
  
  // Callbacks
  onRowClick?: (row: T) => void
  onSortingChange?: (sorting: SortingState[]) => void
  onFilteringChange?: (filtering: FilteringState) => void
  onPaginationChange?: (pagination: PaginationState) => void
  onSelectionChange?: (selection: SelectionState) => void
}