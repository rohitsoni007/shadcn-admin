import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate({ to: '/dashboard' });
  };

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
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