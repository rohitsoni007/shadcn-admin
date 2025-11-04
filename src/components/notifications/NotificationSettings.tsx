
import { Bell, Mail, Volume2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/hooks/use-notifications';
import type { NotificationCategory } from '@/types/notifications';

export function NotificationSettings() {
  const { settings, updateSettings, requestPermission } = useNotifications();

  const handleCategoryToggle = (category: NotificationCategory, enabled: boolean) => {
    updateSettings({
      categories: {
        ...settings.categories,
        [category]: enabled,
      },
    });
  };

  const handlePushNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermission();
      if (granted) {
        updateSettings({ pushNotifications: true });
      }
    } else {
      updateSettings({ pushNotifications: false });
    }
  };

  const categoryLabels: Record<NotificationCategory, { label: string; description: string }> = {
    system: {
      label: 'System Notifications',
      description: 'Updates, maintenance, and system status',
    },
    user: {
      label: 'User Activity',
      description: 'New registrations, user actions, and account changes',
    },
    security: {
      label: 'Security Alerts',
      description: 'Login attempts, security warnings, and access changes',
    },
    update: {
      label: 'Feature Updates',
      description: 'New features, improvements, and announcements',
    },
    reminder: {
      label: 'Reminders',
      description: 'Scheduled tasks, reports, and periodic notifications',
    },
    alert: {
      label: 'Critical Alerts',
      description: 'Urgent issues requiring immediate attention',
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on/off all notifications
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>

          <Separator />

          {/* Delivery methods */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Delivery Methods</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(enabled) => updateSettings({ emailNotifications: enabled })}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Show browser notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={handlePushNotificationToggle}
                disabled={!settings.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm">Sound Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Play sound for new notifications
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(enabled) => updateSettings({ soundEnabled: enabled })}
                disabled={!settings.enabled}
              />
            </div>
          </div>

          <Separator />

          {/* Quiet hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-0.5">
                  <Label className="text-sm">Quiet Hours</Label>
                  <p className="text-xs text-muted-foreground">
                    Disable notifications during specific hours
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.quietHours?.enabled || false}
                onCheckedChange={(enabled) => 
                  updateSettings({ 
                    quietHours: { 
                      ...settings.quietHours,
                      enabled,
                      start: settings.quietHours?.start || '22:00',
                      end: settings.quietHours?.end || '08:00',
                    } 
                  })
                }
                disabled={!settings.enabled}
              />
            </div>

            {settings.quietHours?.enabled && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: {
                          ...settings.quietHours!,
                          start: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) =>
                      updateSettings({
                        quietHours: {
                          ...settings.quietHours!,
                          end: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Category preferences */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notification Categories</h4>
            <p className="text-xs text-muted-foreground">
              Choose which types of notifications you want to receive
            </p>

            <div className="space-y-3">
              {(Object.entries(categoryLabels) as [NotificationCategory, typeof categoryLabels[NotificationCategory]][]).map(
                ([category, { label, description }]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      checked={settings.categories[category]}
                      onCheckedChange={(enabled) => handleCategoryToggle(category, enabled)}
                      disabled={!settings.enabled}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}