import { createFileRoute } from '@tanstack/react-router'
import { APP_NAME } from '@/lib/constants'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to {APP_NAME}</h1>
        <p className="text-xl text-muted-foreground">
          Your comprehensive admin dashboard for managing all aspects of your system.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get started with the most common administrative tasks.
          </p>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-primary hover:underline">
              → View Dashboard
            </button>
            <button className="w-full text-left text-sm text-primary hover:underline">
              → Manage Users
            </button>
            <button className="w-full text-left text-sm text-primary hover:underline">
              → System Settings
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Stay updated with the latest system activities.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>New user registered</span>
              <span className="text-muted-foreground">2m ago</span>
            </div>
            <div className="flex justify-between">
              <span>System backup completed</span>
              <span className="text-muted-foreground">1h ago</span>
            </div>
            <div className="flex justify-between">
              <span>Settings updated</span>
              <span className="text-muted-foreground">3h ago</span>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Monitor the health of your system components.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Database</span>
              <span className="text-green-600">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span>API Services</span>
              <span className="text-green-600">●</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Background Jobs</span>
              <span className="text-green-600">●</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}