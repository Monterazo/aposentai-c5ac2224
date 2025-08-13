import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-states';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'advogado' | 'usuario_comum';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're certain there's no user and not loading
    if (!loading && !user) {
      console.log('ProtectedRoute redirecting to login');
      navigate('/auth/login', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      console.log('ProtectedRoute redirecting due to insufficient role');
      navigate('/dashboard', { replace: true });
    }
  }, [user, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};