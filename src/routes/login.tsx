import { createFileRoute, Navigate, useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { PasswordResetForm } from '@/components/auth/password-reset-form';
import { useAuth } from '@/hooks/use-auth';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || '/',
  }),
});

function LoginPage() {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  const handleLoginSuccess = () => {
    navigate({ to: redirect });
  };

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showPasswordReset ? 'Reset your password' : 'Sign in to your account'}
          </p>
        </div>
        
        {showPasswordReset ? (
          <PasswordResetForm
            onBack={() => setShowPasswordReset(false)}
            onSuccess={handlePasswordResetSuccess}
          />
        ) : (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onForgotPassword={() => setShowPasswordReset(true)}
          />
        )}
      </div>
    </div>
  );
}