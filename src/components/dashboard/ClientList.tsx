import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Clock, CheckCircle, Users } from "lucide-react";
import { NewClientModal } from "./NewClientModal";
import { useClients } from "@/hooks/useClients";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  analysis: { label: "Em Análise", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  pending: { label: "Pendente", color: "bg-blue-100 text-blue-800", icon: FileText },
  completed: { label: "Concluído", color: "bg-green-100 text-green-800", icon: CheckCircle },
  new: { label: "Novo", color: "bg-gray-100 text-gray-800", icon: Users }
};

export const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { clients, loading } = useClients();
  const navigate = useNavigate();
  
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.includes(searchTerm)
  );

  const handleClientClick = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-foreground">Clientes Recentes</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <NewClientModal 
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            }
          />
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
            </p>
            {!searchTerm && (
              <NewClientModal 
                trigger={
                  <Button variant="outline" className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar primeiro cliente
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          filteredClients.map((client) => {
            const StatusIcon = statusConfig[client.status].icon;
            return (
              <div 
                key={client.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleClientClick(client.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">Última atualização</p>
                    <p className="text-sm font-medium">{new Date(client.lastUpdate).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-muted-foreground">Documentos</p>
                    <p className="text-sm font-medium">{client.documentsCount}</p>
                  </div>
                  
                  <Badge className={statusConfig[client.status].color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[client.status].label}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};