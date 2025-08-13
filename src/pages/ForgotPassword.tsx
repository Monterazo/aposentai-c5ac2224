import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { isValidEmail, sanitizeInput } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!email || !isValidEmail(email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        toast.error("Erro ao enviar email de recuperação: " + error.message);
      } else {
        setEmailSent(true);
        toast.success("Email de recuperação enviado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro inesperado ao enviar email de recuperação");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && isValidEmail(email) && !isLoading) {
      handleResetPassword();
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Email enviado!</CardTitle>
            <CardDescription>
              Enviamos um link de recuperação para <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <Button 
              onClick={() => navigate("/auth/login")} 
              variant="outline" 
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(sanitizeInput(e.target.value))}
              onKeyPress={handleKeyPress}
              className="h-12"
              maxLength={254}
              autoComplete="email"
            />
            {email && !isValidEmail(email) && (
              <p className="text-xs text-destructive">Email inválido</p>
            )}
          </div>

          <Button
            onClick={handleResetPassword}
            variant={email && isValidEmail(email) ? "default" : "form"}
            size="full"
            disabled={!email || !isValidEmail(email) || isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>

          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="text-sm text-primary hover:underline inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;