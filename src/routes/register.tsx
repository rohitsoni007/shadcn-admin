import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { RegisterForm } from '@/components/auth/register-form';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate({ to: '/login', search: { redirect: '/dashboard' } });
  };

  const handleBackToLogin = () => {
    navigate({ to: '/login', search: { redirect: '/dashboard' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign up for a new account
          </p>
        </div>
        
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    </div>
  );
}