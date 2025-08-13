import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Entidade {
  id: string;
  nome_fantasia: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cnpj?: string;
  oab_numero?: string;
  tipo: 'advogado_solo' | 'escritorio';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export const useEntidade = () => {
  const [entidade, setEntidade] = useState<Entidade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEntidade = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: entidadeError } = await supabase
        .from('entidades')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (entidadeError && entidadeError.code !== 'PGRST116') {
        throw entidadeError;
      }

      setEntidade(data || null);
    } catch (error: any) {
      console.error('Error fetching entidade:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createEntidade = async (entidadeData: {
    nome_fantasia: string;
    email: string;
    telefone?: string;
    endereco?: string;
    cnpj?: string;
    oab_numero?: string;
    tipo: 'advogado_solo' | 'escritorio';
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('entidades')
        .insert([{
          ...entidadeData,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setEntidade(data);
      toast.success('Entidade criada com sucesso!');
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating entidade:', error);
      toast.error('Erro ao criar entidade');
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchEntidade();
  }, [user]);

  return {
    entidade,
    loading,
    error,
    createEntidade,
    fetchEntidade
  };
};