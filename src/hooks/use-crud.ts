import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface CrudState<T> {
  // Dialog states
  createDialogOpen: boolean
  editDialogOpen: boolean
  deleteDialogOpen: boolean
  viewDialogOpen: boolean
  
  // Selected item
  selectedItem: T | null
  
  // Bulk operations
  selectedItems: T[]
  bulkDeleteDialogOpen: boolean
}

export interface CrudActions<T, CreateData, UpdateData> {
  // Dialog actions
  openCreateDialog: () => void
  closeCreateDialog: () => void
  openEditDialog: (item: T) => void
  closeEditDialog: () => void
  openDeleteDialog: (item: T) => void
  closeDeleteDialog: () => void
  openViewDialog: (item: T) => void
  closeViewDialog: () => void
  
  // CRUD operations
  handleCreate: (data: CreateData) => Promise<void>
  handleUpdate: (data: UpdateData) => Promise<void>
  handleDelete: () => Promise<void>
  
  // Bulk operations
  handleBulkSelect: (items: T[]) => void
  openBulkDeleteDialog: () => void
  closeBulkDeleteDialog: () => void
  handleBulkDelete: () => Promise<void>
  
  // Utility
  resetState: () => void
}

export interface CrudHookOptions<T, CreateData, UpdateData> {
  // Mutation functions
  createMutation: {
    mutateAsync: (data: CreateData) => Promise<any>
    isPending: boolean
  }
  updateMutation: {
    mutateAsync: (data: UpdateData & { id: string }) => Promise<any>
    isPending: boolean
  }
  deleteMutation: {
    mutateAsync: (data: { id: string }) => Promise<any>
    isPending: boolean
  }
  bulkDeleteMutation?: {
    mutateAsync: (data: { ids: string[] }) => Promise<any>
    isPending: boolean
  }
  
  // Messages
  messages?: {
    createSuccess?: string
    updateSuccess?: string
    deleteSuccess?: string
    bulkDeleteSuccess?: string
  }
  
  // ID accessor
  getItemId: (item: T) => string
}

const defaultMessages = {
  createSuccess: 'Item created successfully',
  updateSuccess: 'Item updated successfully',
  deleteSuccess: 'Item deleted successfully',
  bulkDeleteSuccess: 'Items deleted successfully',
}

export function useCrud<T, CreateData, UpdateData>({
  createMutation,
  updateMutation,
  deleteMutation,
  bulkDeleteMutation,
  messages = defaultMessages,
  getItemId,
}: CrudHookOptions<T, CreateData, UpdateData>): [CrudState<T>, CrudActions<T, CreateData, UpdateData>] {
  
  const [state, setState] = useState<CrudState<T>>({
    createDialogOpen: false,
    editDialogOpen: false,
    deleteDialogOpen: false,
    viewDialogOpen: false,
    selectedItem: null,
    selectedItems: [],
    bulkDeleteDialogOpen: false,
  })

  // Dialog actions
  const openCreateDialog = useCallback(() => {
    setState(prev => ({ ...prev, createDialogOpen: true }))
  }, [])

  const closeCreateDialog = useCallback(() => {
    setState(prev => ({ ...prev, createDialogOpen: false }))
  }, [])

  const openEditDialog = useCallback((item: T) => {
    setState(prev => ({ ...prev, editDialogOpen: true, selectedItem: item }))
  }, [])

  const closeEditDialog = useCallback(() => {
    setState(prev => ({ ...prev, editDialogOpen: false, selectedItem: null }))
  }, [])

  const openDeleteDialog = useCallback((item: T) => {
    setState(prev => ({ ...prev, deleteDialogOpen: true, selectedItem: item }))
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setState(prev => ({ ...prev, deleteDialogOpen: false, selectedItem: null }))
  }, [])

  const openViewDialog = useCallback((item: T) => {
    setState(prev => ({ ...prev, viewDialogOpen: true, selectedItem: item }))
  }, [])

  const closeViewDialog = useCallback(() => {
    setState(prev => ({ ...prev, viewDialogOpen: false, selectedItem: null }))
  }, [])

  // CRUD operations
  const handleCreate = useCallback(async (data: CreateData) => {
    try {
      await createMutation.mutateAsync(data)
      closeCreateDialog()
      toast.success(messages.createSuccess)
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  }, [createMutation, messages.createSuccess])

  const handleUpdate = useCallback(async (data: UpdateData) => {
    if (!state.selectedItem) return

    try {
      await updateMutation.mutateAsync({ 
        ...data, 
        id: getItemId(state.selectedItem) 
      } as UpdateData & { id: string })
      closeEditDialog()
      toast.success(messages.updateSuccess)
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  }, [state.selectedItem, updateMutation, messages.updateSuccess, getItemId])

  const handleDelete = useCallback(async () => {
    if (!state.selectedItem) return

    try {
      await deleteMutation.mutateAsync({ id: getItemId(state.selectedItem) })
      closeDeleteDialog()
      toast.success(messages.deleteSuccess)
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  }, [state.selectedItem, deleteMutation, messages.deleteSuccess, getItemId])

  // Bulk operations
  const handleBulkSelect = useCallback((items: T[]) => {
    setState(prev => ({ ...prev, selectedItems: items }))
  }, [])

  const openBulkDeleteDialog = useCallback(() => {
    setState(prev => ({ ...prev, bulkDeleteDialogOpen: true }))
  }, [])

  const closeBulkDeleteDialog = useCallback(() => {
    setState(prev => ({ ...prev, bulkDeleteDialogOpen: false, selectedItems: [] }))
  }, [])

  const handleBulkDelete = useCallback(async () => {
    if (!bulkDeleteMutation || state.selectedItems.length === 0) return

    try {
      const ids = state.selectedItems.map(getItemId)
      await bulkDeleteMutation.mutateAsync({ ids })
      closeBulkDeleteDialog()
      toast.success(messages.bulkDeleteSuccess)
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  }, [state.selectedItems, bulkDeleteMutation, messages.bulkDeleteSuccess, getItemId])

  // Utility
  const resetState = useCallback(() => {
    setState({
      createDialogOpen: false,
      editDialogOpen: false,
      deleteDialogOpen: false,
      viewDialogOpen: false,
      selectedItem: null,
      selectedItems: [],
      bulkDeleteDialogOpen: false,
    })
  }, [])

  const actions: CrudActions<T, CreateData, UpdateData> = {
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    openViewDialog,
    closeViewDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBulkSelect,
    openBulkDeleteDialog,
    closeBulkDeleteDialog,
    handleBulkDelete,
    resetState,
  }

  return [state, actions]
}