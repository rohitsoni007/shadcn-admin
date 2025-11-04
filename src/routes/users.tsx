import { createFileRoute } from '@tanstack/react-router';
import { createLazyRoute } from '@/lib/lazy-loading';

const LazyUsersPage = createLazyRoute(
  () => import('@/components/users/UsersPage').then(module => ({ default: module.UsersPage })),
  'Loading users...'
);

export const Route = createFileRoute('/users')({
  component: LazyUsersPage,
});