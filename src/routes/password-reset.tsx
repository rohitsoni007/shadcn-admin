import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { PasswordResetConfirmForm } from '@/components/auth/password-reset-confirm-form';

export const Route = createFileRoute('/password-reset')({
  component: PasswordResetPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string,
  }),
});

function PasswordResetPage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: '/password-reset' });

  const handleSuccess = () => {
    navigate({ to: '/login' });
  };

  const handleBack = () => {
    navigate({ to: '/login' });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your new password
          </p>
        </div>
        
        <PasswordResetConfirmForm
          token={token}
          onSuccess={handleSuccess}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}