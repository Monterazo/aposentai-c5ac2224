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
    if (!loading && !user) {
      navigate('/auth/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      navigate('/dashboard');
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