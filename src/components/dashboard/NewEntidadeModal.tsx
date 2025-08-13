import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEntidade } from "@/hooks/useEntidade";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Building, Plus } from "lucide-react";

interface NewEntidadeModalProps {
  onEntidadeCreated?: (entidade: any) => void;
  trigger?: React.ReactNode;
}

export const NewEntidadeModal = ({ onEntidadeCreated, trigger }: NewEntidadeModalProps) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createEntidade } = useEntidade();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome_fantasia: "",
    email: user?.email || "",
    telefone: "",
    endereco: "",
    cnpj: "",
    oab_numero: "",
    tipo: "" as 'advogado_solo' | 'escritorio' | ""
  });

  const handleSave = async () => {
    if (!formData.nome_fantasia || !formData.email || !formData.tipo) {
      toast.error("Por favor, preencha os campos obrigatórios (Nome, Email e Tipo).");
      return;
    }

    if (formData.tipo === 'advogado_solo' && !formData.oab_numero) {
      toast.error("Para advogado solo, o número da OAB é obrigatório.");
      return;
    }

    if (formData.tipo === 'escritorio' && !formData.cnpj) {
      toast.error("Para escritório, o CNPJ é obrigatório.");
      return;
    }

    setIsLoading(true);

    const result = await createEntidade({
      nome_fantasia: formData.nome_fantasia,
      email: formData.email,
      telefone: formData.telefone,
      endereco: formData.endereco,
      cnpj: formData.cnpj,
      oab_numero: formData.oab_numero,
      tipo: formData.tipo as 'advogado_solo' | 'escritorio'
    });

    if (result.success) {
      // Reset form and close modal
      setFormData({
        nome_fantasia: "",
        email: user?.email || "",
        telefone: "",
        endereco: "",
        cnpj: "",
        oab_numero: "",
        tipo: ""
      });
      setOpen(false);
      onEntidadeCreated?.(result.data);
    }

    setIsLoading(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Criar Entidade
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
            <Building className="w-5 h-5" />
            <span>Nova Entidade</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_fantasia">Nome/Razão Social *</Label>
                <Input
                  id="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                  placeholder="Digite o nome da entidade"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contato@entidade.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo de Entidade *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as 'advogado_solo' | 'escritorio' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advogado_solo">Advogado Solo</SelectItem>
                    <SelectItem value="escritorio">Escritório</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.tipo === 'advogado_solo' && (
              <div>
                <Label htmlFor="oab_numero">Número da OAB *</Label>
                <Input
                  id="oab_numero"
                  value={formData.oab_numero}
                  onChange={(e) => setFormData(prev => ({ ...prev, oab_numero: e.target.value }))}
                  placeholder="123456"
                  className="mt-1"
                />
              </div>
            )}

            {formData.tipo === 'escritorio' && (
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Endereço completo"
                className="mt-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Entidade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};