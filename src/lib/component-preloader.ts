import { ComponentType } from 'react';

// Component preloader for better performance
class ComponentPreloader {
  private preloadedComponents = new Map<string, Promise<{ default: ComponentType<any> }>>();

  // Preload a component
  preload(key: string, importFn: () => Promise<{ default: ComponentType<any> }>) {
    if (!this.preloadedComponents.has(key)) {
      this.preloadedComponents.set(key, importFn());
    }
    return this.preloadedComponents.get(key)!;
  }

  // Get preloaded component or load it
  get(key: string, importFn: () => Promise<{ default: ComponentType<any> }>) {
    return this.preloadedComponents.get(key) || this.preload(key, importFn);
  }

  // Preload multiple components
  preloadMultiple(components: Record<string, () => Promise<{ default: ComponentType<any> }>>) {
    Object.entries(components).forEach(([key, importFn]) => {
      this.preload(key, importFn);
    });
  }

  // Clear preloaded components
  clear() {
    this.preloadedComponents.clear();
  }
}

export const componentPreloader = new ComponentPreloader();

// Preload critical components on app start
export function preloadCriticalComponents() {
  componentPreloader.preloadMultiple({
    'dashboard-widgets': () => import('@/components/dashboard/widgets'),
    'users-page': () => import('@/components/users/UsersPage').then(m => ({ default: m.UsersPage })),
    'settings-page': () => import('@/components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })),
    'chart-widget': () => import('@/components/dashboard/widgets/ChartWidget').then(m => ({ default: m.ChartWidget })),
  });
}

// Preload components on hover for better UX
export function preloadOnHover(componentKey: string, importFn: () => Promise<{ default: ComponentType<any> }>) {
  return {
    onMouseEnter: () => componentPreloader.preload(componentKey, importFn),
    onFocus: () => componentPreloader.preload(componentKey, importFn),
  };
}