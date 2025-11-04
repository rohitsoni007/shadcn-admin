import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiError, ApiParams, PaginatedResponse } from '@/types/api'
import { toast } from 'sonner'

// Generic query hook
export function useApiQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  params?: ApiParams,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, ApiError>({
    queryKey: [...queryKey, params],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams()
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })
      }

      const queryString = searchParams.toString()
      const url = queryString ? `${endpoint}?${queryString}` : endpoint
      
      return apiClient.get<T>(url, signal)
    },
    ...options,
  })
}

// Paginated query hook
export function usePaginatedQuery<T>(
  queryKey: QueryKey,
  endpoint: string,
  params?: ApiParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>, ApiError>, 'queryKey' | 'queryFn'>
) {
  return useApiQuery<PaginatedResponse<T>>(queryKey, endpoint, params, options)
}

// Generic mutation hook with error handling
export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'An error occurred')
      
      // Call custom error handler if provided
      options?.onError?.(error, {} as TVariables, undefined)
    },
    onSuccess: (data, variables, context) => {
      // Call custom success handler if provided
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

// Create mutation hook
export function useCreateMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: {
    invalidateQueries?: QueryKey[]
    successMessage?: string
  } & UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient()

  return useApiMutation<TData, TVariables>(
    (variables) => apiClient.post<TData>(endpoint, variables),
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Show success message
        if (options?.successMessage) {
          toast.success(options.successMessage)
        }

        // Invalidate related queries
        if (options?.invalidateQueries) {
          options.invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey })
          })
        }

        // Call custom success handler
        options?.onSuccess?.(data, variables, context)
      },
    }
  )
}

// Update mutation hook
export function useUpdateMutation<TData = unknown, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  options?: {
    invalidateQueries?: QueryKey[]
    successMessage?: string
  } & UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient()

  return useApiMutation<TData, TVariables>(
    (variables) => {
      const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint
      return apiClient.put<TData>(url, variables)
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Show success message
        if (options?.successMessage) {
          toast.success(options.successMessage)
        }

        // Invalidate related queries
        if (options?.invalidateQueries) {
          options.invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey })
          })
        }

        // Call custom success handler
        options?.onSuccess?.(data, variables, context)
      },
    }
  )
}

// Delete mutation hook
export function useDeleteMutation<TData = unknown, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  options?: {
    invalidateQueries?: QueryKey[]
    successMessage?: string
  } & UseMutationOptions<TData, ApiError, TVariables>
) {
  const queryClient = useQueryClient()

  return useApiMutation<TData, TVariables>(
    (variables) => {
      const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint
      return apiClient.delete<TData>(url)
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        // Show success message
        if (options?.successMessage) {
          toast.success(options.successMessage)
        }

        // Invalidate related queries
        if (options?.invalidateQueries) {
          options.invalidateQueries.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey })
          })
        }

        // Call custom success handler
        options?.onSuccess?.(data, variables, context)
      },
    }
  )
}