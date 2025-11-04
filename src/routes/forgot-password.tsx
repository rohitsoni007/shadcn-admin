import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Stay on the same page to show success message
  };

  const handleBackToLogin = () => {
    navigate({ to: '/login', search: { redirect: '/dashboard' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to reset your password
          </p>
        </div>
        
        <PasswordResetForm
          onSuccess={handleSuccess}
          onBack={handleBackToLogin}
        />
      </div>
    </div>
  );
}