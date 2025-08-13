import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Client } from '@/types/client';
import { toast } from 'sonner';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Busca clientes do usuário diretamente
      const { data: clientsData, error: clientsError } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        throw clientsError;
      }

      // Busca contagem de documentos para cada cliente
      const clientsWithCounts = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { count: documentsCount } = await supabase
            .from('documentos')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', client.id);

          const { count: analysesCount } = await supabase
            .from('analises')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', client.id);

          // Calcula progresso baseado em documentos e análises
          const progress = documentsCount ? Math.min(100, (documentsCount * 10) + (analysesCount ? analysesCount * 20 : 0)) : 0;
          
          // Define status baseado no progresso
          let status: "pending" | "analysis" | "completed" | "new" = "new";
          if (progress > 80) status = "completed";
          else if (progress > 30) status = "analysis";
          else if (documentsCount && documentsCount > 0) status = "pending";

          // Define prioridade baseada na data de criação
          const daysSinceCreated = Math.floor((Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24));
          let priority: "high" | "medium" | "low" = "low";
          if (daysSinceCreated > 30) priority = "high";
          else if (daysSinceCreated > 14) priority = "medium";

          return {
            ...client,
            name: client.nome,
            documentsCount: documentsCount || 0,
            progress,
            status,
            priority,
            lastUpdate: client.updated_at.split('T')[0],
            simulationsCount: analysesCount || 0,
            reportsCount: 0 // TODO: implementar quando tiver tabela de relatórios
          };
        })
      );

      setClients(clientsWithCounts);
    } catch (error: any) {
      console.error('Error in fetchClients:', error);
      setError(error.message);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'entidade_id' | 'documentsCount' | 'progress' | 'status' | 'priority' | 'lastUpdate' | 'simulationsCount' | 'reportsCount'>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nome: clientData.name,
          cpf: clientData.cpf,
          email: clientData.email,
          telefone: clientData.phone,
          endereco: clientData.endereco,
          rg: clientData.rg,
          data_nascimento: clientData.data_nascimento,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Cliente criado com sucesso!');
      fetchClients(); // Recarrega a lista
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast.error('Erro ao criar cliente');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    createClient
  };
};