import { createFileRoute } from '@tanstack/react-router';
import { createLazyRoute } from '@/lib/lazy-loading';

const LazySettingsPage = createLazyRoute(
  () => import('@/components/settings/SettingsPage').then(module => ({ default: module.SettingsPage })),
  'Loading settings...'
);

export const Route = createFileRoute('/settings')({
  component: LazySettingsPage,
});