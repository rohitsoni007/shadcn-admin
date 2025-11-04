import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface OptimisticUpdateConfig<T> {
  queryClient: QueryClient
  queryKey: any[]
  getItemId: (item: T) => string
  onError?: (error: any, rollback: () => void) => void
}

// Optimistic create
export function optimisticCreate<T>(
  config: OptimisticUpdateConfig<T>,
  newItem: T
) {
  const { queryClient, queryKey } = config

  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey })

  // Snapshot previous value
  const previousData = queryClient.getQueryData(queryKey)

  // Optimistically update
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old
    
    if (Array.isArray(old)) {
      return [...old, newItem]
    }
    
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: [...old.data, newItem],
      }
    }
    
    return old
  })

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData)
  }
}

// Optimistic update
export function optimisticUpdate<T>(
  config: OptimisticUpdateConfig<T>,
  updatedItem: T
) {
  const { queryClient, queryKey, getItemId } = config
  const itemId = getItemId(updatedItem)

  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey })

  // Snapshot previous value
  const previousData = queryClient.getQueryData(queryKey)

  // Optimistically update
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old
    
    const updateArray = (items: T[]) =>
      items.map(item => 
        getItemId(item) === itemId ? updatedItem : item
      )
    
    if (Array.isArray(old)) {
      return updateArray(old)
    }
    
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: updateArray(old.data),
      }
    }
    
    return old
  })

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData)
  }
}

// Optimistic delete
export function optimisticDelete<T>(
  config: OptimisticUpdateConfig<T>,
  itemId: string
) {
  const { queryClient, queryKey, getItemId } = config

  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey })

  // Snapshot previous value
  const previousData = queryClient.getQueryData(queryKey)

  // Optimistically update
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old
    
    const filterArray = (items: T[]) =>
      items.filter(item => getItemId(item) !== itemId)
    
    if (Array.isArray(old)) {
      return filterArray(old)
    }
    
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: filterArray(old.data),
      }
    }
    
    return old
  })

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData)
  }
}

// Optimistic bulk delete
export function optimisticBulkDelete<T>(
  config: OptimisticUpdateConfig<T>,
  itemIds: string[]
) {
  const { queryClient, queryKey, getItemId } = config

  // Cancel outgoing refetches
  queryClient.cancelQueries({ queryKey })

  // Snapshot previous value
  const previousData = queryClient.getQueryData(queryKey)

  // Optimistically update
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old
    
    const filterArray = (items: T[]) =>
      items.filter(item => !itemIds.includes(getItemId(item)))
    
    if (Array.isArray(old)) {
      return filterArray(old)
    }
    
    if (old.data && Array.isArray(old.data)) {
      return {
        ...old,
        data: filterArray(old.data),
      }
    }
    
    return old
  })

  // Return rollback function
  return () => {
    queryClient.setQueryData(queryKey, previousData)
  }
}

// Enhanced mutation options with optimistic updates
export function withOptimisticUpdates<T, TVariables>(
  config: OptimisticUpdateConfig<T>,
  type: 'create' | 'update' | 'delete' | 'bulkDelete'
) {
  return {
    onMutate: async (variables: TVariables) => {
      let rollback: (() => void) | undefined

      try {
        switch (type) {
          case 'create':
            rollback = optimisticCreate(config, variables as T)
            break
          case 'update':
            rollback = optimisticUpdate(config, variables as T)
            break
          case 'delete':
            const deleteId = (variables as any).id
            rollback = optimisticDelete(config, deleteId)
            break
          case 'bulkDelete':
            const deleteIds = (variables as any).ids
            rollback = optimisticBulkDelete(config, deleteIds)
            break
        }
      } catch (error) {
        console.error('Optimistic update failed:', error)
      }

      return { rollback }
    },
    onError: (error: any, variables: TVariables, context: any) => {
      // Rollback optimistic update
      if (context?.rollback) {
        context.rollback()
        toast.error('Changes have been reverted due to an error')
      }

      // Call custom error handler
      config.onError?.(error, context?.rollback)
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      config.queryClient.invalidateQueries({ queryKey: config.queryKey })
    },
  }
}