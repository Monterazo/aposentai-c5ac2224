import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  CreditCard, 
  Bell, 
  Globe, 
  Eye, 
  EyeOff, 
  Camera, 
  Save, 
  LogOut,
  Loader2,
  Calendar,
  MapPin,
  FileText,
  Crown,
  Clock
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Settings = () => {
  const { profile, loading, updateProfile, uploadAvatar, changePassword, toggleTwoFactor, getTrialDaysRemaining, isTrialExpired } = useProfile();
  const { signOut } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    gender: '' as 'M' | 'F' | 'NB' | '',
    oab_number: '',
    oab_state: ''
  });

  // Inicializar formulário quando o perfil carregar
  useState(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || '',
        oab_number: profile.oab_number || '',
        oab_state: profile.oab_state || ''
      });
    }
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB');
      return;
    }

    await uploadAvatar(file);
  };

  const handleProfileUpdate = async () => {
    setIsUpdating(true);

    // Validar CPF se fornecido
    if (profileForm.cpf) {
      const cleanCpf = profileForm.cpf.replace(/[^0-9]/g, '');
      if (cleanCpf.length !== 11) {
        toast.error('CPF deve ter 11 dígitos');
        setIsUpdating(false);
        return;
      }
    }

    // Validar telefone se fornecido
    if (profileForm.phone) {
      const cleanPhone = profileForm.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        toast.error('Telefone deve ter 10 ou 11 dígitos');
        setIsUpdating(false);
        return;
      }
    }

    const result = await updateProfile({
      ...profileForm,
      gender: profileForm.gender || undefined
    } as any);
    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.error || 'Erro ao atualizar perfil');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  const trialDaysRemaining = getTrialDaysRemaining();
  const trialExpired = isTrialExpired();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com avatar e informações básicas */}
      <Card className="p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-xl">
                {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/80 transition-colors">
              <Camera className="w-4 h-4 text-primary-foreground" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={profile.role === 'advogado' ? 'default' : 'secondary'}>
                {profile.role === 'advogado' ? 'Advogado' : 'Usuário'}
              </Badge>
              {profile.subscription_status === 'trial' && (
                <Badge variant={trialExpired ? 'destructive' : 'outline'} className="flex items-center space-x-1">
                  {trialExpired ? (
                    <>
                      <Clock className="w-3 h-3" />
                      <span>Trial Expirado</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-3 h-3" />
                      <span>{trialDaysRemaining} dias restantes</span>
                    </>
                  )}
                </Badge>
              )}
              {profile.subscription_status === 'active' && (
                <Badge className="flex items-center space-x-1">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs de configurações */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Assinatura</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Preferências</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Perfil */}
        <TabsContent value="profile">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(prev => ({...prev, full_name: e.target.value}))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={profileForm.cpf}
                  onChange={(e) => setProfileForm(prev => ({...prev, cpf: e.target.value}))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={profileForm.birth_date}
                  onChange={(e) => setProfileForm(prev => ({...prev, birth_date: e.target.value}))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select value={profileForm.gender} onValueChange={(value) => setProfileForm(prev => ({...prev, gender: value as "M" | "F" | "NB" | ""}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="NB">Não-binário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {profile.role === 'advogado' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="oab_number">Número da OAB</Label>
                    <Input
                      id="oab_number"
                      value={profileForm.oab_number}
                      onChange={(e) => setProfileForm(prev => ({...prev, oab_number: e.target.value}))}
                      placeholder="123456"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oab_state">Estado da OAB</Label>
                    <Select value={profileForm.oab_state} onValueChange={(value) => setProfileForm(prev => ({...prev, oab_state: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
                          'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
                          'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
                        ].map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Segurança */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Autenticação de dois fatores */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Autenticação de Dois Fatores</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de dois fatores</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Switch
                  checked={profile.two_factor_enabled}
                  onCheckedChange={(checked) => toggleTwoFactor(checked)}
                />
              </div>
            </Card>

            {/* Alteração de senha */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Alterar Senha</h3>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current_password">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                      placeholder="Sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                      placeholder="Sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                      placeholder="Confirme sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handlePasswordChange}>
                  Alterar Senha
                </Button>
              </div>
            </Card>

            {/* Sair da conta */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sair da Conta</h3>
              <p className="text-muted-foreground mb-4">
                Você será desconectado de todos os dispositivos
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Sair
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Assinatura */}
        <TabsContent value="subscription">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Plano Atual</h3>
            
            {profile.subscription_status === 'trial' && (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-primary">Período de Avaliação Gratuita</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {trialExpired 
                      ? 'Seu período de avaliação expirou. Faça upgrade para continuar usando.'
                      : `Você tem ${trialDaysRemaining} dias restantes no seu período de avaliação gratuita.`
                    }
                  </p>
                </div>
                
                <Button className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Fazer Upgrade para Premium
                </Button>
              </div>
            )}

            {profile.subscription_status === 'active' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-800">Plano Premium Ativo</h4>
                  </div>
                  <p className="text-sm text-green-600">
                    Sua assinatura está ativa e você tem acesso a todos os recursos premium.
                  </p>
                </div>
                
                <Button variant="outline" className="w-full">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              </div>
            )}

            <Separator className="my-6" />

            <div className="space-y-4">
              <h4 className="font-medium">Recursos Premium</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Análise ilimitada de aposentadoria</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Upload ilimitado de documentos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Suporte prioritário</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span>Relatórios detalhados em PDF</span>
                </li>
              </ul>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Preferências */}
        <TabsContent value="preferences">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preferências</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações por e-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações sobre sua conta e análises
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações push</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Newsletter</p>
                  <p className="text-sm text-muted-foreground">
                    Receba dicas e atualizações sobre previdência
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <Select defaultValue="America/Sao_Paulo">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};