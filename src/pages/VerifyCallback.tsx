import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { toast } from "sonner";

const VerifyCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleVerify = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const redirectTo = searchParams.get('redirect_to');

        if (!token || !type) {
          toast.error("Link inválido");
          navigate('/auth/login');
          return;
        }

        if (type === 'recovery') {
          // Para recuperação de senha, usa o exchangeCodeForSession
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(token);

            if (error) {
              console.error('Recovery verification error:', error);
              if (error.message.includes('expired') || error.message.includes('invalid')) {
                toast.error("Link de recuperação expirado. Solicite um novo link.");
                navigate('/auth/forgot-password');
              } else {
                toast.error("Erro ao verificar link de recuperação");
                navigate('/auth/login');
              }
              return;
            }

            if (data.session) {
              toast.success("Link verificado! Redefina sua senha agora.");
              // Passa os tokens pela URL para o reset-password
              const params = new URLSearchParams({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                type: 'recovery'
              });
              navigate(`/auth/reset-password?${params.toString()}`);
            } else {
              toast.error("Sessão não estabelecida");
              navigate('/auth/forgot-password');
            }
          } catch (exchangeError) {
            console.error('Exchange code error:', exchangeError);
            toast.error("Link de recuperação inválido ou expirado. Solicite um novo link.");
            navigate('/auth/forgot-password');
          }
        } else if (type === 'signup') {
          // Para confirmação de email, usa exchangeCodeForSession também
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(token);

            if (error) {
              toast.error("Erro ao confirmar email: " + error.message);
              navigate('/auth/login');
            } else {
              toast.success("Email confirmado com sucesso!");
              navigate('/dashboard');
            }
          } catch (exchangeError) {
            console.error('Exchange code error for signup:', exchangeError);
            toast.error("Link de confirmação inválido ou expirado");
            navigate('/auth/login');
          }
        } else {
          toast.error("Tipo de verificação não suportado");
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Verify callback error:', error);
        toast.error("Erro durante verificação");
        navigate('/auth/login');
      }
    };

    handleVerify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Verificando link...</p>
      </div>
    </div>
  );
};

export default VerifyCallback;