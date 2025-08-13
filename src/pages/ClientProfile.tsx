import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { DocumentUpload } from "@/components/dashboard/DocumentUpload";
import { RetirementSimulation } from "@/components/dashboard/RetirementSimulation";
import { ReportGenerator } from "@/components/dashboard/ReportGenerator";
import { INSSForms } from "@/components/dashboard/INSSForms";
import { ProfileAnalysis } from "@/components/dashboard/ProfileAnalysis";
import { ArrowLeft, FileText, Calculator, FileSpreadsheet, FormInput, TrendingUp, Home, User, LayoutDashboard, Trash2, UserCheck } from "lucide-react";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useClients } from "@/hooks/useClients";

const ClientProfile = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const { client, loading, error } = useClientProfile(clientId);
  const { deleteClient } = useClients();

  const handleDeleteClient = async () => {
    if (clientId) {
      const result = await deleteClient(clientId);
      if (result.success) {
        navigate('/dashboard');
      }
    }
  };

  const breadcrumbItems = [
    {
      href: "/dashboard",
      label: "Início",
      icon: Home
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      href: `/client/${clientId}`,
      label: client?.name || "Cliente",
      icon: User,
      current: true
    }
  ];

  if (loading) {
    return (
      <AuthenticatedLayout breadcrumbItems={breadcrumbItems}>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados do cliente...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error || !client) {
    return (
      <AuthenticatedLayout breadcrumbItems={breadcrumbItems}>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Cliente não encontrado</p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout breadcrumbItems={breadcrumbItems}>
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>

          {/* Client Overview Card */}
          <Card className="p-6 mb-6 border-input-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Informações do Cliente</h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>CPF: {client.cpf}</span>
                <span>Email: {client.email || 'Não informado'}</span>
                {client.phone && <span>Tel: {client.phone}</span>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4 bg-muted/30">
                <h3 className="font-medium text-foreground mb-2">Documentos</h3>
                <p className="text-2xl font-bold text-primary">{client.documentsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Arquivos enviados</p>
              </Card>
              <Card className="p-4 bg-muted/30">
                <h3 className="font-medium text-foreground mb-2">Simulações</h3>
                <p className="text-2xl font-bold text-primary">{client.simulationsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Regras analisadas</p>
              </Card>
              <Card className="p-4 bg-muted/30">
                <h3 className="font-medium text-foreground mb-2">Relatórios</h3>
                <p className="text-2xl font-bold text-primary">{client.reportsCount || 0}</p>
                <p className="text-sm text-muted-foreground">Gerados</p>
              </Card>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="info" className="space-x-2">
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Informações</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="space-x-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Análise</span>
              </TabsTrigger>
              <TabsTrigger value="simulation" className="space-x-2">
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">Simulação</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="space-x-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Relatórios</span>
              </TabsTrigger>
              <TabsTrigger value="forms" className="space-x-2">
                <FormInput className="w-4 h-4" />
                <span className="hidden sm:inline">Requerimento</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                        <p className="text-foreground">{client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">CPF</label>
                        <p className="text-foreground">{client.cpf}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-foreground">{client.email || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <p className="text-foreground">{client.phone || 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                        <p className="text-foreground">{client.data_nascimento ? new Date(client.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">RG</label>
                        <p className="text-foreground">{client.rg || 'Não informado'}</p>
                      </div>
                    </div>
                    {client.endereco && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                        <p className="text-foreground">{client.endereco}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Estatísticas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{client.documentsCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Documentos</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{client.simulationsCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Simulações</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{client.reportsCount || 0}</p>
                        <p className="text-sm text-muted-foreground">Relatórios</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-destructive mb-4">Zona de Perigo</h3>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        Esta ação é irreversível. Todos os dados relacionados a este cliente serão permanentemente removidos.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Excluir Cliente
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o cliente "{client.name}"? Esta ação não pode ser desfeita e todos os documentos, análises e relatórios relacionados serão perdidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteClient}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir Permanentemente
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <DocumentUpload />
            </TabsContent>

            <TabsContent value="analysis">
              <ProfileAnalysis />
            </TabsContent>

            <TabsContent value="simulation">
              <RetirementSimulation />
            </TabsContent>

            <TabsContent value="reports">
              <ReportGenerator />
            </TabsContent>

            <TabsContent value="forms">
              <INSSForms />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AuthenticatedLayout>
  );
};

export default ClientProfile;