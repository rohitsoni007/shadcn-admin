import { 
  useApiQuery, 
  usePaginatedQuery,
  useCreateMutation,
  useUpdateMutation,
  useDeleteMutation 
} from './use-api'
import { ApiParams, PaginatedResponse } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import { withOptimisticUpdates } from '@/lib/optimistic-updates'

// User types
export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
  role: string
  password: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  status?: 'active' | 'inactive' | 'pending'
}

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ApiParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// Hooks
export function useUsers(params?: ApiParams) {
  return usePaginatedQuery<User>(
    userKeys.list(params),
    '/users',
    params,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

export function useUser(id: string) {
  return useApiQuery<User>(
    userKeys.detail(id),
    `/users/${id}`,
    undefined,
    {
      enabled: !!id,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  )
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useCreateMutation<User, CreateUserData>(
    '/users',
    {
      invalidateQueries: [userKeys.lists()],
      successMessage: 'User created successfully',
      ...withOptimisticUpdates<User, CreateUserData>(
        {
          queryClient,
          queryKey: userKeys.lists(),
          getItemId: (user) => user.id,
        },
        'create'
      ),
    }
  )
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useUpdateMutation<User, UpdateUserData & { id: string }>(
    (variables) => `/users/${variables.id}`,
    {
      invalidateQueries: [userKeys.all],
      successMessage: 'User updated successfully',
      ...withOptimisticUpdates<User, UpdateUserData & { id: string }>(
        {
          queryClient,
          queryKey: userKeys.all,
          getItemId: (user) => user.id,
        },
        'update'
      ),
    }
  )
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useDeleteMutation<void, { id: string }>(
    (variables) => `/users/${variables.id}`,
    {
      invalidateQueries: [userKeys.all],
      successMessage: 'User deleted successfully',
      ...withOptimisticUpdates<User, { id: string }>(
        {
          queryClient,
          queryKey: userKeys.all,
          getItemId: (user) => user.id,
        },
        'delete'
      ),
    }
  )
}