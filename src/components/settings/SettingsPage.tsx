import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationSettings } from '@/components/notifications';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Bell, Palette, Shield, Database, Download, Upload, Trash2 } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <div className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </div>
                </div>
                <ThemeToggle />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Layout Preferences</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode" className="text-sm font-normal">
                      Compact mode
                    </Label>
                    <Switch id="compact-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sidebar-collapsed" className="text-sm font-normal">
                      Collapse sidebar by default
                    </Label>
                    <Switch id="sidebar-collapsed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Password</Label>
                <div className="grid gap-2">
                  <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password" className="text-sm">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Two-Factor Authentication</Label>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm">Enable 2FA</div>
                    <div className="text-xs text-muted-foreground">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Session Management</Label>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm">Auto-logout timeout</div>
                    <div className="text-xs text-muted-foreground">
                      Automatically log out after inactivity
                    </div>
                  </div>
                  <Input className="w-20" defaultValue="30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, and manage your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base">Export Data</Label>
                <div className="grid gap-3">
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Dashboard Configuration
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Analytics Data
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base">Import Data</Label>
                <div className="grid gap-3">
                  <Button variant="outline" className="justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Dashboard Configuration
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Import User Data
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <Label className="text-base text-destructive">Danger Zone</Label>
                <div className="rounded-lg border border-destructive/20 p-4 space-y-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Clear All Data</div>
                    <div className="text-xs text-muted-foreground">
                      This will permanently delete all your data. This action cannot be undone.
                    </div>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}