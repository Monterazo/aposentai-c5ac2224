import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Home, Search, LayoutDashboard } from "lucide-react";
import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout";
import { NewClientModal } from "@/components/dashboard/NewClientModal";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { HelpWidget } from "@/components/help/HelpWidget";
import { KeyboardShortcuts } from "@/components/ui/keyboard-shortcuts";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/types/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "analysis" | "pending" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  const { isSearchVisible, closeSearch } = useGlobalSearch();
  const { clients, loading } = useClients();

  const handleClientSelect = (client: Client) => {
    navigate(`/client/${client.id}`);
  };

  const getBreadcrumbTrail = () => {
    const trail = [];
    
    // Always start with home
    trail.push({
      href: "/dashboard",
      label: "Início",
      icon: Home
    });
    
    // Add current page
    trail.push({
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      current: true
    });
    
    return trail;
  };

  const filteredClients = clients.filter(client => {
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.cpf.replace(/[.-]/g, '').includes(searchQuery.replace(/[.-]/g, ''));
    return matchesStatus && matchesSearch;
  });

  const completedClients = clients.filter(c => c.status === "completed").length;
  const activeClients = clients.filter(c => c.status !== "completed").length;
  const analysisClients = clients.filter(c => c.status === "analysis").length;
  const pendingClients = clients.filter(c => c.status === "pending").length;
  const totalDocuments = clients.reduce((sum, c) => sum + (c.documentsCount || 0), 0);
  const avgProgress = clients.length > 0 ? Math.round(clients.reduce((sum, c) => sum + (c.progress || 0), 0) / clients.length) : 0;

  return (
    <AuthenticatedLayout breadcrumbItems={getBreadcrumbTrail()}>
      {/* Onboarding Tour */}
      <OnboardingTour
        isVisible={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />

      {/* Help Widget */}
      <HelpWidget />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts />

      {/* Global Search */}
      <GlobalSearch isVisible={isSearchVisible} onClose={closeSearch} />

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Overview Cards */}
        <div data-tour="dashboard-stats">
          <DashboardStats
            activeClients={activeClients}
            analysisClients={analysisClients}
            completedClients={completedClients}
            avgProgress={avgProgress}
          />
        </div>

        {/* Clients Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Client List */}
          <div className="lg:col-span-3" data-tour="client-section">
            <Card className="p-6">
              {/* Título destacado */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Meus Clientes</h2>
              </div>
              
              {/* Barra de Busca */}
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              
              {/* Controles de Filtros */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto overflow-x-auto">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                    className="whitespace-nowrap"
                  >
                    Todos
                  </Button>
                  <Button
                    variant={statusFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("new")}
                    className="whitespace-nowrap"
                  >
                    Novos
                  </Button>
                  <Button
                    variant={statusFilter === "analysis" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("analysis")}
                    className="whitespace-nowrap"
                  >
                    Em Análise
                  </Button>
                  <Button
                    variant={statusFilter === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("pending")}
                    className="whitespace-nowrap"
                  >
                    Pendentes
                  </Button>
                  <Button
                    variant={statusFilter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("completed")}
                    className="whitespace-nowrap"
                  >
                    Concluídos
                  </Button>
                </div>
                <div className="flex items-center space-x-4">
                  <NewClientModal 
                    trigger={
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Cliente
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Client Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-muted-foreground">Carregando clientes...</div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {clients.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
                  </p>
                  {clients.length === 0 && (
                    <NewClientModal 
                      trigger={
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Criar primeiro cliente
                        </Button>
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onClick={handleClientSelect}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6" data-tour="analysis-tools">
            <DashboardSummary
              totalDocuments={totalDocuments}
              pendingClients={pendingClients}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dashboard;