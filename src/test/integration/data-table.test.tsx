import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import React from 'react'

// Mock data for testing
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
]

// Simple data table component for testing
const DataTable = ({ data }: { data: typeof mockUsers }) => {
  const [sortField, setSortField] = React.useState<string>('')
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [filter, setFilter] = React.useState('')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(filter.toLowerCase()) ||
    item.email.toLowerCase().includes(filter.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return (
    <div data-testid="data-table">
      <input
        type="text"
        placeholder="Search users..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        data-testid="search-input"
      />
      
      <table>
        <thead>
          <tr>
            <th>
              <button onClick={() => handleSort('name')} data-testid="sort-name">
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </th>
            <th>
              <button onClick={() => handleSort('email')} data-testid="sort-email">
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((user) => (
            <tr key={user.id} data-testid={`user-row-${user.id}`}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div data-testid="results-count">
        Showing {sortedData.length} of {data.length} users
      </div>
    </div>
  )
}

describe('Data Table Integration', () => {
  it('renders table with data', () => {
    render(<DataTable data={mockUsers} />)
    
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('filters data based on search input', () => {
    render(<DataTable data={mockUsers} />)
    
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'john' } })
    
    // Should show John Doe and Bob Johnson (contains 'john')
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 2 of 3 users')
  })

  it('sorts data by name', () => {
    render(<DataTable data={mockUsers} />)
    
    const sortButton = screen.getByTestId('sort-name')
    fireEvent.click(sortButton)
    
    // Check if sort indicator is shown
    expect(sortButton).toHaveTextContent('Name ↑')
    
    // Get all user rows and check order
    const rows = screen.getAllByTestId(/user-row-/)
    expect(rows[0]).toHaveTextContent('Bob Johnson')
    expect(rows[1]).toHaveTextContent('Jane Smith')
    expect(rows[2]).toHaveTextContent('John Doe')
  })

  it('toggles sort direction', () => {
    render(<DataTable data={mockUsers} />)
    
    const sortButton = screen.getByTestId('sort-name')
    
    // First click - ascending
    fireEvent.click(sortButton)
    expect(sortButton).toHaveTextContent('Name ↑')
    
    // Second click - descending
    fireEvent.click(sortButton)
    expect(sortButton).toHaveTextContent('Name ↓')
    
    // Check order is reversed
    const rows = screen.getAllByTestId(/user-row-/)
    expect(rows[0]).toHaveTextContent('John Doe')
    expect(rows[1]).toHaveTextContent('Jane Smith')
    expect(rows[2]).toHaveTextContent('Bob Johnson')
  })

  it('combines filtering and sorting', () => {
    render(<DataTable data={mockUsers} />)
    
    // First filter
    const searchInput = screen.getByTestId('search-input')
    fireEvent.change(searchInput, { target: { value: 'john' } }) // Should match John Doe and Bob Johnson
    
    // Then sort by email
    const sortButton = screen.getByTestId('sort-email')
    fireEvent.click(sortButton)
    
    // Should show Bob first (bob@example.com), then John (john@example.com)
    const rows = screen.getAllByTestId(/user-row-/)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Bob Johnson')
    expect(rows[1]).toHaveTextContent('John Doe')
    
    expect(screen.getByTestId('results-count')).toHaveTextContent('Showing 2 of 3 users')
  })
})