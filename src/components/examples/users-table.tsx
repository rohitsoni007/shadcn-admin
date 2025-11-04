import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SimpleDataTable, SimpleColumn } from '@/components/ui/simple-data-table'
import { useUsers, User } from '@/hooks/use-users'
import { Edit, Trash2, Eye } from 'lucide-react'

interface UsersTableProps {
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
  onViewUser?: (user: User) => void
}

export function UsersTable({ onEditUser, onDeleteUser, onViewUser }: UsersTableProps) {
  const { data, isLoading, error, refetch } = useUsers()

  const columns: SimpleColumn<User>[] = [
    {
      key: 'avatar',
      header: '',
      width: '60px',
      render: (_, user) => (
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (role) => (
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (status) => (
        <Badge 
          variant={
            status === 'active' ? 'default' : 
            status === 'inactive' ? 'destructive' : 
            'secondary'
          }
          className="capitalize"
        >
          {status}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      render: (_, user) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onViewUser?.(user)
            }}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View user</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEditUser?.(user)
            }}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit user</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteUser?.(user)
            }}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete user</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <SimpleDataTable
      data={data?.data || []}
      columns={columns}
      loading={isLoading}
      error={error}
      searchable
      selectable
      pagination
      pageSize={10}
      onRowClick={(user) => onViewUser?.(user)}
      emptyMessage="No users found"
    />
  )
}