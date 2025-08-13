import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Check, X, Home, UserPlus, ArrowLeft } from "lucide-react";
import { sanitizeInput, isValidEmail, isValidOAB, isValidCPF, isValidPhone, isValidDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Register = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    gender: "",
    profileName: "",
    cpf: "",
    phone: "",
    birthDate: "",
    oab: "",
    uf: "",
    password: ""
  });
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Validação melhorada para nome completo
  const isValidProfileName = (name: string) => {
    const names = name.trim().split(' ').filter(n => n.length > 0);
    return names.length >= 2 && name.length >= 4 && name.length <= 100 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
  };

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

  const passwordValidation = getPasswordValidation(formData.password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, canProceed: boolean) => {
    if (e.key === 'Enter' && canProceed && !isLoading) {
      if (step < 4) {
        handleNext();
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = async () => {
    // Validações completas antes do envio
    if (!isPasswordValid) {
      toast.error('Senha não atende aos critérios de segurança');
      return;
    }
    
    if (!isValidOAB(formData.oab) || !formData.uf) {
      toast.error('Dados da OAB inválidos');
      return;
    }

    if (!isValidCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error('Telefone inválido');
      return;
    }

    if (!isValidDate(formData.birthDate)) {
      toast.error('Data de nascimento inválida ou menor de 18 anos');
      return;
    }

    setIsLoading(true);

    const result = await signUp(
      formData.email,
      formData.password,
      formData.profileName,
      'advogado'
    );

    if (result.success) {
      navigate(`/email-confirmation?email=${encodeURIComponent(formData.email)}`);
    }

    setIsLoading(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex items-center">
          <button 
            onClick={() => num <= step && setStep(num)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              num === step ? 'bg-foreground text-background' : 
              num < step ? 'bg-foreground text-background cursor-pointer hover:bg-foreground/80' : 'bg-muted text-muted-foreground'
            } ${num <= step ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            disabled={num > step}
          >
            {num}
          </button>
          {num < 4 && <div className="w-12 h-px bg-border mx-2"></div>}
        </div>
      ))}
    </div>
  );

  const renderStepLabels = () => (
    <div className="flex justify-center space-x-8 mb-12">
      <span className={`text-sm ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
        E-mail
      </span>
      <span className={`text-sm ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
        Dados Básicos
      </span>
      <span className={`text-sm ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
        OAB
      </span>
      <span className={`text-sm ${step >= 4 ? 'text-foreground' : 'text-muted-foreground'}`}>
        Senha
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Página Inicial
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Registro
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Crie sua conta</h1>
          <p className="text-muted-foreground">
            Preencha os dados para começar a usar o AposentAI
          </p>
        </div>

        {renderStepIndicator()}
        {renderStepLabels()}

        <div className="space-y-6">
          {/* Step 1: Email */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: sanitizeInput(e.target.value)})}
                    onKeyPress={(e) => handleKeyPress(e, formData.email && isValidEmail(formData.email))}
                    className="h-14"
                    maxLength={254}
                  />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-xs text-destructive">E-mail inválido</p>
                )}
              </div>
              
              <Button 
                onClick={handleNext}
                variant={formData.email && isValidEmail(formData.email) ? "default" : "form"}
                size="full"
                disabled={!formData.email || !isValidEmail(formData.email)}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Basic Data */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Gênero</label>
                    <RadioGroup 
                      value={formData.gender} 
                      onValueChange={(value) => setFormData({...formData, gender: value})}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="M" id="male" />
                        <Label htmlFor="male">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="F" id="female" />
                        <Label htmlFor="female">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NB" id="nonbinary" />
                        <Label htmlFor="nonbinary">Não-binário</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Nome completo (ex: Maria Silva Santos)"
                      value={formData.profileName}
                      onChange={(e) => setFormData({...formData, profileName: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, !!(formData.gender && isValidProfileName(formData.profileName) && formData.cpf && formData.phone && formData.birthDate))}
                      className="h-14"
                      maxLength={100}
                    />
                    {formData.profileName && !isValidProfileName(formData.profileName) && (
                      <p className="text-xs text-destructive">Nome deve ter pelo menos 2 palavras e entre 4-100 caracteres</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="CPF (000.000.000-00)"
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: sanitizeInput(e.target.value)})}
                      className="h-14"
                      maxLength={14}
                    />
                    {formData.cpf && !isValidCPF(formData.cpf) && (
                      <p className="text-xs text-destructive">CPF inválido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="tel"
                      placeholder="Telefone (11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: sanitizeInput(e.target.value)})}
                      className="h-14"
                      maxLength={15}
                    />
                    {formData.phone && !isValidPhone(formData.phone) && (
                      <p className="text-xs text-destructive">Telefone inválido</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Data de nascimento</label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="h-14"
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                    {formData.birthDate && !isValidDate(formData.birthDate) && (
                      <p className="text-xs text-destructive">Data inválida ou menor de 18 anos</p>
                    )}
                  </div>
              </div>

              <Button 
                onClick={handleNext}
                variant={formData.gender && isValidProfileName(formData.profileName) && isValidCPF(formData.cpf) && isValidPhone(formData.phone) && isValidDate(formData.birthDate) ? "default" : "form"}
                size="full"
                disabled={!formData.gender || !isValidProfileName(formData.profileName) || !isValidCPF(formData.cpf) || !isValidPhone(formData.phone) || !isValidDate(formData.birthDate)}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 3: OAB */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Número da OAB (apenas números)"
                    value={formData.oab}
                    onChange={(e) => setFormData({...formData, oab: sanitizeInput(e.target.value.replace(/\D/g, ''))})}
                    onKeyPress={(e) => handleKeyPress(e, !!(isValidOAB(formData.oab) && formData.uf))}
                    className="h-14"
                    maxLength={10}
                  />
                  {formData.oab && !isValidOAB(formData.oab) && (
                    <p className="text-xs text-destructive">Número da OAB deve ter entre 4-6 dígitos</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Select value={formData.uf} onValueChange={(value) => setFormData({...formData, uf: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado da OAB" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
                      ].map(state => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleNext}
                variant={isValidOAB(formData.oab) && formData.uf ? "default" : "form"}
                size="full"
                disabled={!isValidOAB(formData.oab) || !formData.uf}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 4: Password */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crie uma senha segura"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: sanitizeInput(e.target.value)})}
                    onKeyPress={(e) => handleKeyPress(e, isPasswordValid)}
                    className="h-14 pr-12"
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

              <div className="flex justify-center">
                <Button 
                  onClick={handleFinish}
                  variant={!isPasswordValid ? "form" : "default"}
                  className="px-16"
                  disabled={!isPasswordValid || isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Concluir cadastro"}
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm space-y-2">
            <div>
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link to="/auth/login" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </div>
            <div className="pt-2">
              <Link to="/" className="text-muted-foreground hover:text-primary inline-flex items-center text-sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;