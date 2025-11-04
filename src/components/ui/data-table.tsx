import { useState, useMemo, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
} from '@tanstack/react-table'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingState, ErrorState } from '@/components/ui/loading-spinner'
import { DataTableConfig, ColumnDef, TableAction, BulkAction } from '@/types/data-table'

interface DataTableProps<T> extends DataTableConfig<T> {
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  pagination = { enabled: true, pageSize: 10, pageSizeOptions: [10, 20, 50, 100] },
  sorting = { enabled: true, multiple: false },
  filtering = { enabled: true, globalSearch: true, columnFilters: true },
  selection = { enabled: false, multiple: true },
  actions = [],
  bulkActions = [],
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  striped = false,
  bordered = false,
  compact = false,
  stickyHeader = false,
  onRowClick,
  onSortingChange,
  onFilteringChange,
  onPaginationChange,
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  // Table state
  const [sortingState, setSortingState] = useState<SortingState[]>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: pagination.pageSize || 10,
  })

  // Enhanced columns with selection and actions
  const enhancedColumns = useMemo(() => {
    const cols: ColumnDef<T>[] = []

    // Add selection column
    if (selection.enabled) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      } as any)
    }

    // Add data columns
    cols.push(...columns.map(col => ({
      ...col,
      enableSorting: sorting.enabled && (col.sortable !== false),
      enableColumnFilter: filtering.enabled && filtering.columnFilters && (col.filterable !== false),
    })))

    // Add actions column
    if (actions.length > 0) {
      cols.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {actions.map((action) => {
              const isHidden = action.hidden?.(row.original)
              const isDisabled = action.disabled?.(row.original)
              
              if (isHidden) return null
              
              return (
                <Button
                  key={action.id}
                  variant={action.variant || 'ghost'}
                  size="sm"
                  onClick={() => action.onClick(row.original)}
                  disabled={isDisabled}
                  className="h-8 w-8 p-0"
                >
                  {action.icon}
                  <span className="sr-only">{action.label}</span>
                </Button>
              )
            })}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      } as any)
    }

    return cols
  }, [columns, selection.enabled, sorting.enabled, filtering.enabled, filtering.columnFilters, actions])

  // Table instance
  const table = useReactTable({
    data,
    columns: enhancedColumns,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination.enabled ? getPaginationRowModel() : undefined,
    getSortedRowModel: sorting.enabled ? getSortedRowModel() : undefined,
    getFilteredRowModel: filtering.enabled ? getFilteredRowModel() : undefined,
    state: {
      sorting: sortingState,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination: paginationState,
    },
    enableRowSelection: selection.enabled,
    enableMultiRowSelection: selection.multiple,
  })

  // Callbacks
  const handleSortingChange = useCallback((newSorting: SortingState[]) => {
    setSortingState(newSorting)
    onSortingChange?.(newSorting)
  }, [onSortingChange])

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    setPaginationState(newPagination)
    onPaginationChange?.(newPagination)
  }, [onPaginationChange])

  // Selected rows for bulk actions
  const selectedRows = useMemo(() => {
    return table.getFilteredSelectedRowModel().rows.map(row => row.original)
  }, [table, rowSelection])

  // Loading state
  if (loading) {
    return <LoadingState message="Loading data..." />
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Global search */}
          {filtering.enabled && filtering.globalSearch && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-8 w-[250px]"
              />
            </div>
          )}

          {/* Bulk actions */}
          {selection.enabled && bulkActions.length > 0 && selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              {bulkActions.map((action) => {
                const isDisabled = action.disabled?.(selectedRows)
                
                return (
                  <Button
                    key={action.id}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => action.onClick(selectedRows)}
                    disabled={isDisabled}
                    className="gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Columns
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className={cn(
        'rounded-md border',
        stickyHeader && 'max-h-[600px] overflow-auto'
      )}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={cn(
                      header.column.getCanSort() && 'cursor-pointer select-none',
                      compact && 'py-2'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          {header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    striped && index % 2 === 0 && 'bg-muted/50',
                    onRowClick && 'cursor-pointer hover:bg-muted/50',
                    compact && 'h-10'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className={cn(compact && 'py-2')}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={enhancedColumns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.enabled && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}