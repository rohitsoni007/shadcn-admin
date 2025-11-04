import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormDialog } from '@/components/ui/form-dialog'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { UsersTable } from '@/components/examples/users-table'
import { UserForm } from '@/components/forms/user-form'
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  User,
  CreateUserData,
  UpdateUserData 
} from '@/hooks/use-users'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

export function UserCrud() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Queries and mutations
  const { data: usersData, isLoading } = useUsers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  // Handlers
  const handleCreateUser = async (data: CreateUserData) => {
    try {
      await createUserMutation.mutateAsync(data)
      setCreateDialogOpen(false)
      toast.success('User created successfully')
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!selectedUser) return

    try {
      await updateUserMutation.mutateAsync({ ...data, id: selectedUser.id })
      setEditDialogOpen(false)
      setSelectedUser(null)
      toast.success('User updated successfully')
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedUser) return

    try {
      await deleteUserMutation.mutateAsync({ id: selectedUser.id })
      setDeleteDialogOpen(false)
      setSelectedUser(null)
      toast.success('User deleted successfully')
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleViewUser = (user: User) => {
    // In a real app, this might navigate to a user detail page
    toast.info(`Viewing user: ${user.name}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A list of all users in the system with their roles and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewUser={handleViewUser}
          />
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <FormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Create New User"
        description="Add a new user to the system"
        submitLabel="Create User"
        loading={createUserMutation.isPending}
        onSubmit={() => {
          // The form submission is handled by the UserForm component
          const form = document.querySelector('form')
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
            form.dispatchEvent(submitEvent)
          }
        }}
      >
        <UserForm
          onSubmit={handleCreateUser}
          loading={createUserMutation.isPending}
        />
      </FormDialog>

      {/* Edit User Dialog */}
      <FormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        title="Edit User"
        description="Update user information and settings"
        submitLabel="Update User"
        loading={updateUserMutation.isPending}
        onSubmit={() => {
          // The form submission is handled by the UserForm component
          const form = document.querySelector('form')
          if (form) {
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
            form.dispatchEvent(submitEvent)
          }
        }}
      >
        {selectedUser && (
          <UserForm
            user={selectedUser}
            onSubmit={handleUpdateUser}
            loading={updateUserMutation.isPending}
          />
        )}
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description={
          selectedUser
            ? `Are you sure you want to delete ${selectedUser.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this user?'
        }
        confirmLabel="Delete User"
        variant="destructive"
        loading={deleteUserMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}