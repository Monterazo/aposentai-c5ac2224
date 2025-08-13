import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Client } from '@/types/client';
import { toast } from 'sonner';

export const useClientProfile = (clientId: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClientProfile = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Busca cliente específico do usuário diretamente
      const { data: clientData, error: clientError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single();

      if (clientError) {
        console.error('Error fetching client:', clientError);
        throw clientError;
      }

      if (!clientData) {
        setError('Cliente não encontrado');
        return;
      }

      // Busca contagem de documentos
      const { count: documentsCount } = await supabase
        .from('documentos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clientId);

      // Busca contagem de análises  
      const { count: analysesCount } = await supabase
        .from('analises')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clientId);

      // Calcula progresso baseado em documentos e análises
      const progress = documentsCount ? Math.min(100, (documentsCount * 10) + (analysesCount ? analysesCount * 20 : 0)) : 0;
      
      // Define status baseado no progresso
      let status: "pending" | "analysis" | "completed" | "new" = "new";
      if (progress > 80) status = "completed";
      else if (progress > 30) status = "analysis";  
      else if (documentsCount && documentsCount > 0) status = "pending";

      const clientProfile: Client = {
        ...clientData,
        name: clientData.nome,
        phone: clientData.telefone,
        documentsCount: documentsCount || 0,
        progress,
        status,
        priority: "medium",
        lastUpdate: clientData.updated_at.split('T')[0],
        simulationsCount: analysesCount || 0,
        reportsCount: 0 // TODO: implementar quando tiver tabela de relatórios
      };

      setClient(clientProfile);
    } catch (error: any) {
      console.error('Error in fetchClientProfile:', error);
      setError(error.message);
      toast.error('Erro ao carregar dados do cliente');
    } finally {
      setLoading(false);
    }
  };

  const updateClient = async (updates: Partial<Client>) => {
    if (!clientId || !user) return { success: false, error: 'Dados inválidos' };

    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: updates.name,
          cpf: updates.cpf,
          email: updates.email,
          telefone: updates.phone,
          endereco: updates.endereco,
          rg: updates.rg,
          data_nascimento: updates.data_nascimento
        })
        .eq('id', clientId);

      if (error) throw error;

      toast.success('Cliente atualizado com sucesso!');
      fetchClientProfile(); // Recarrega os dados
      return { success: true };
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast.error('Erro ao atualizar cliente');
      return { success: false, error: error.message };
    }
  };

  const saveSimulationData = async (simulationData: {
    dataNascimento: string;
    genero: string;
    dataInicioContribuicao: string;
    salarioAtual: number;
    trabalhoRural: boolean;
    trabalhoEspecial: boolean;
    professor: boolean;
    anosTrabalhoEspecial?: number;
    anosTrabalhoRural?: number;
    anosMagisterio?: number;
  }) => {
    if (!clientId || !user) return { success: false, error: 'Dados inválidos' };

    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          data_nascimento_simulacao: simulationData.dataNascimento,
          genero_simulacao: simulationData.genero,
          data_inicio_contribuicao_simulacao: simulationData.dataInicioContribuicao,
          salario_atual_simulacao: simulationData.salarioAtual,
          trabalho_rural_simulacao: simulationData.trabalhoRural,
          trabalho_especial_simulacao: simulationData.trabalhoEspecial,
          professor_simulacao: simulationData.professor,
          anos_trabalho_especial_simulacao: simulationData.anosTrabalhoEspecial || 0,
          anos_trabalho_rural_simulacao: simulationData.anosTrabalhoRural || 0,
          anos_magisterio_simulacao: simulationData.anosMagisterio || 0,
          ultima_simulacao_data: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      toast.success('Dados da simulação salvos no perfil do cliente!');
      fetchClientProfile(); // Recarrega os dados
      return { success: true };
    } catch (error: any) {
      console.error('Error saving simulation data:', error);
      toast.error('Erro ao salvar dados da simulação');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchClientProfile();
  }, [clientId, user]);

  return {
    client,
    loading,
    error,
    fetchClientProfile,
    updateClient,
    saveSimulationData
  };
};