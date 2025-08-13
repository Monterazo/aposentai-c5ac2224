import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { sanitizeInput, isValidEmail } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import lawyerHero from "@/assets/lawyer-hero.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const MAX_LOGIN_ATTEMPTS = 5;

  const handleLogin = async () => {
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      alert("Muitas tentativas de login. Tente novamente em alguns minutos.");
      return;
    }

    if (!email || !password || !isValidEmail(email)) {
      setLoginAttempts(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      // Manual redirect after successful login
      navigate('/dashboard', { replace: true });
    } else {
      setLoginAttempts(prev => prev + 1);
      if (loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
        alert("Muitas tentativas de login falharam. Conta temporariamente bloqueada.");
      }
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password && isValidEmail(email) && !isLoading) {
      handleLogin();
    }
  };

  const handleGoogleLogin = () => {
    // Redirecionar para registro para confirmar OAB e UF
    navigate("/auth/register");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${lawyerHero})` }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Logo Container */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-primary mb-2">AposentAI</h1>
            <p className="text-muted-foreground text-lg">
              Sua aposentadoria está mais próxima do que você imagina
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Bem-vindo!</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="E-mail" 
                value={email} 
                onChange={e => setEmail(sanitizeInput(e.target.value))} 
                onKeyPress={handleKeyPress} 
                className="h-14"
                maxLength={254}
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha" 
                  value={password} 
                  onChange={e => setPassword(sanitizeInput(e.target.value))} 
                  onKeyPress={handleKeyPress} 
                  className="h-14 pr-12"
                  maxLength={128}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleLogin} 
              variant={email && password && isValidEmail(email) ? "default" : "form"} 
              size="full" 
              className="mt-6" 
              disabled={!email || !password || !isValidEmail(email) || loginAttempts >= MAX_LOGIN_ATTEMPTS || isLoading}
            >
              {isLoading ? "Entrando..." : loginAttempts >= MAX_LOGIN_ATTEMPTS ? "Conta Bloqueada" : "Entrar"}
            </Button>
          </div>

          <div className="space-y-3">
            <Button onClick={handleGoogleLogin} variant="social" size="full" className="justify-start space-x-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span>Entre com o Google</span>
            </Button>
          </div>

          <div className="text-center text-sm space-y-2">
            <div>
              <button onClick={() => navigate("/auth/forgot-password")} className="text-primary font-medium hover:underline">
                Esqueceu sua senha?
              </button>
            </div>
            <div>
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <button onClick={() => navigate("/auth/register")} className="text-primary font-medium hover:underline">
                Registre-se
              </button>
            </div>
            <div className="pt-2">
              <Link to="/" className="text-muted-foreground hover:text-primary inline-flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <span>AposentAI</span>
            <span className="mx-2">-</span>
            <span>Todos os direitos reservados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;