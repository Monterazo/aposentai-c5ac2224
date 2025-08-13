import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Clock, CheckCircle, FileText, Trash2 } from "lucide-react";
import { validateCPF } from "@/lib/utils";
import { Client } from "@/types/client";

interface ClientCardProps {
  client: Client;
  onClick: (client: Client) => void;
  onDelete?: (clientId: string) => void;
}

const statusConfig = {
  new: { label: "Novo", color: "bg-[hsl(var(--status-new-bg))] text-[hsl(var(--status-new-text))]", icon: FileText },
  analysis: { label: "Em Análise", color: "bg-[hsl(var(--status-analysis-bg))] text-[hsl(var(--status-analysis-text))]", icon: Clock },
  pending: { label: "Pendente", color: "bg-[hsl(var(--status-pending-bg))] text-[hsl(var(--status-pending-text))]", icon: FileText },
  completed: { label: "Concluído", color: "bg-[hsl(var(--status-completed-bg))] text-[hsl(var(--status-completed-text))]", icon: CheckCircle }
};

const priorityConfig = {
  high: { label: "Alta", color: "bg-red-500" },
  medium: { label: "Média", color: "bg-yellow-500" },
  low: { label: "Baixa", color: "bg-green-500" }
};

export const ClientCard = ({ client, onClick, onDelete }: ClientCardProps) => {
  const status = statusConfig[client.status || 'new'];
  const priority = priorityConfig[client.priority || 'medium'];
  const StatusIcon = status.icon;
  
  return (
    <div className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors relative">
      <div 
        className="cursor-pointer"
        onClick={() => onClick(client)}
      >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback>
              {client.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground">{client.name}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">CPF: {client.cpf}</p>
              {validateCPF(client.cpf) ? (
                <div className="w-3 h-3" title="CPF válido">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-red-500" title="CPF inválido" />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${priority.color}`} title={`Prioridade ${priority.label}`}></div>
          <Badge className={status.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </div>
      
      {/* Botão de deletar - posicionado no canto superior direito */}
      {onDelete && (
        <div className="absolute top-2 right-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o cliente "{client.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(client.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="text-foreground">{client.progress || 0}%</span>
        </div>
        <Progress value={client.progress || 0} className="h-2" />
      </div>
      
      <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground">
        <span>{client.documentsCount || 0} documentos</span>
        <span>Atualizado em {client.lastUpdate || client.updated_at?.split('T')[0] || 'N/A'}</span>
      </div>
      </div>
    </div>
  );
};