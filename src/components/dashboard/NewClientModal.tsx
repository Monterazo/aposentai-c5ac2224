import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClients } from "@/hooks/useClients";
import { useEntidade } from "@/hooks/useEntidade";
import { toast } from "sonner";
import { Users, Plus, Building } from "lucide-react";

interface NewClientModalProps {
  onClientCreated?: (client: any) => void;
  trigger?: React.ReactNode;
}

export const NewClientModal = ({ onClientCreated, trigger }: NewClientModalProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createClient } = useClients();
  const { entidade, createEntidade } = useEntidade();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    occupation: "",
    endereco: "",
    rg: ""
  });

  const handleSave = async () => {
    if (!formData.name || !formData.cpf || !formData.birthDate) {
      toast.error("Por favor, preencha os campos obrigatórios (Nome, CPF e Data de Nascimento).");
      return;
    }

    // Verificar se existe entidade
    if (!entidade) {
      toast.error("Você precisa criar um perfil de entidade antes de cadastrar clientes.");
      return;
    }

    setIsLoading(true);

    const result = await createClient({
      name: formData.name,
      cpf: formData.cpf,
      email: formData.email,
      phone: formData.phone,
      data_nascimento: formData.birthDate,
      endereco: formData.endereco,
      rg: formData.rg
    });

    if (result.success) {
      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        birthDate: "",
        occupation: "",
        endereco: "",
        rg: ""
      });
      setOpen(false);
      onClientCreated?.(result.data);
      
      // Navigate to the new client's dashboard
      if (result.data) {
        navigate(`/client/${result.data.id}`);
      }
    }

    setIsLoading(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Novo Cliente
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Novo Cliente</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="cliente@email.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                  placeholder="00.000.000-0"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
            
            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Endereço completo do cliente..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};