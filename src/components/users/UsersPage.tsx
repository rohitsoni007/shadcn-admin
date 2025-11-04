import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable } from '@/components/crud/DataTable';
import { ExportButton } from '@/components/data-export';
import { ImportDialog } from '@/components/data-import';
import { createValidator } from '@/lib/data-import';
import { Search, Plus, Filter, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  avatar?: string;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'active',
    lastLogin: '2024-01-15',
    avatar: 'https://github.com/shadcn.png'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'active',
    lastLogin: '2024-01-14'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Moderator',
    status: 'inactive',
    lastLogin: '2024-01-10'
  }
];

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'User',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return <Badge variant="secondary">{role}</Badge>;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'active' ? 'default' : status === 'inactive' ? 'destructive' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    }
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ row }) => {
      const date = row.getValue('lastLogin') as string;
      return <span className="text-sm">{new Date(date).toLocaleDateString()}</span>;
    }
  }
];

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>(sampleUsers);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // User data validation schema
  const userValidator = createValidator({
    name: ['required'],
    email: ['required', 'email'],
    role: ['required'],
    status: ['required']
  });

  const handleImportUsers = (importedData: any[]) => {
    try {
      // Transform imported data to match User interface
      const newUsers: User[] = importedData.map((row, index) => ({
        id: row.id || `imported-${Date.now()}-${index}`,
        name: row.name || row.Name || '',
        email: row.email || row.Email || '',
        role: row.role || row.Role || 'User',
        status: (row.status || row.Status || 'active').toLowerCase() as 'active' | 'inactive' | 'pending',
        lastLogin: row.lastLogin || row['Last Login'] || new Date().toISOString().split('T')[0],
        avatar: row.avatar || row.Avatar
      }));

      setUsers(prevUsers => [...prevUsers, ...newUsers]);
      toast.success(`Successfully imported ${newUsers.length} users`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import users');
    }
  };

  // Export columns configuration
  const exportColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'lastLogin', header: 'Last Login', formatter: (value: string) => new Date(value).toLocaleDateString() }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ImportDialog
            onImport={handleImportUsers}
            validateData={userValidator}
            acceptedFormats={['.csv', '.json', '.xlsx']}
          >
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </ImportDialog>
          
          <ExportButton
            data={filteredUsers}
            filename="users"
            columns={exportColumns}
            size="sm"
          />
          
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all user accounts in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={filteredUsers}
            searchKey="name"
            exportFilename="users"
            onImport={handleImportUsers}
            enableExport={true}
            enableImport={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}