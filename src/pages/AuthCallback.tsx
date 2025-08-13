import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth tokens from URL hash or search params
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Error setting session:', error);
            toast.error("Erro ao processar autenticação");
            navigate('/auth/login');
            return;
          }

          // Handle different auth types
          if (type === 'signup') {
            toast.success("Email confirmado com sucesso!");
            navigate('/dashboard');
          } else if (type === 'recovery') {
            toast.success("Redirecionando para redefinição de senha...");
            navigate('/auth/reset-password?' + searchParams.toString());
          } else {
            navigate('/dashboard');
          }
        } else {
          // No tokens found, redirect to login
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error("Erro durante autenticação");
        navigate('/auth/login');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;