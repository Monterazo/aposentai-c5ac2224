import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Check, X, Lock } from "lucide-react";
import { sanitizeInput } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Password validation
  const getPasswordValidation = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = getPasswordValidation(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  useEffect(() => {
    // Check if we have the required URL params for password reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast.error("Link de redefinição inválido ou expirado");
      navigate("/auth/login");
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async () => {
    if (!isPasswordValid) {
      toast.error("Senha não atende aos critérios de segurança");
      return;
    }

    if (!passwordsMatch) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error("Erro ao redefinir senha: " + error.message);
      } else {
        toast.success("Senha redefinida com sucesso!");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Erro inesperado ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isPasswordValid && passwordsMatch && !isLoading) {
      handleResetPassword();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Redefinir senha</CardTitle>
          <CardDescription>
            Digite sua nova senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(sanitizeInput(e.target.value))}
                  onKeyPress={handleKeyPress}
                  className="h-12 pr-12"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(sanitizeInput(e.target.value))}
                  onKeyPress={handleKeyPress}
                  className="h-12 pr-12"
                  maxLength={128}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">As senhas não coincidem</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Sua senha deve conter:</p>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {passwordValidation.length ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.length ? 'text-green-600' : 'text-muted-foreground'}`}>
                  Pelo menos 8 caracteres
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.uppercase ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  Uma letra maiúscula
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.lowercase ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                  Uma letra minúscula
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.number ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.number ? 'text-green-600' : 'text-muted-foreground'}`}>
                  Um número
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {passwordValidation.special ? (
                  <Check size={12} className="text-green-600" />
                ) : (
                  <X size={12} className="text-red-500" />
                )}
                <span className={`text-xs ${passwordValidation.special ? 'text-green-600' : 'text-muted-foreground'}`}>
                  Um símbolo (!@#$%^&*)
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleResetPassword}
            variant={isPasswordValid && passwordsMatch ? "default" : "form"}
            size="full"
            disabled={!isPasswordValid || !passwordsMatch || isLoading}
          >
            {isLoading ? "Redefinindo..." : "Redefinir senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;