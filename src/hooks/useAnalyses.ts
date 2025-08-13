import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Analysis {
  id: string;
  cliente_id: string;
  tipo_aposentadoria_id: string | null;
  analista_id: string;
  resultado_analise: string | null;
  observacoes: string | null;
  percentual_completude: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisData {
  cliente_id: string;
  tipo_aposentadoria_id?: string;
  resultado_analise?: string;
  observacoes?: string;
  percentual_completude?: number;
}

export const useAnalyses = (clientId?: string) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalyses = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('analises')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAnalyses(data || []);
    } catch (error: any) {
      console.error('Error fetching analyses:', error);
      setError(error.message);
      toast.error('Erro ao carregar análises');
    } finally {
      setLoading(false);
    }
  };

  const createAnalysis = async (analysisData: CreateAnalysisData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('analises')
        .insert([{
          ...analysisData,
          analista_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Análise criada com sucesso!');
      fetchAnalyses(); // Recarrega a lista
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating analysis:', error);
      toast.error('Erro ao criar análise');
      return { success: false, error: error.message };
    }
  };

  const getLatestAnalysis = () => {
    return analyses.length > 0 ? analyses[0] : null;
  };

  const getAnalysisStats = () => {
    const total = analyses.length;
    const withRecommendation = analyses.filter(analysis => analysis.tipo_aposentadoria_id).length;
    const avgCompleteness = analyses.length > 0 
      ? Math.round(analyses.reduce((sum, analysis) => sum + (analysis.percentual_completude || 0), 0) / analyses.length)
      : 0;

    return {
      total,
      withRecommendation,
      avgCompleteness,
      hasRecommendation: withRecommendation > 0
    };
  };

  useEffect(() => {
    fetchAnalyses();
  }, [clientId, user]);

  // Configurar realtime updates
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analises',
          filter: `cliente_id=eq.${clientId}`
        },
        () => {
          fetchAnalyses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return {
    analyses,
    loading,
    error,
    fetchAnalyses,
    createAnalysis,
    getLatestAnalysis,
    getAnalysisStats
  };
};