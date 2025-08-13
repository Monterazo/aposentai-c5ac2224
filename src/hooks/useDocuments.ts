import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Document {
  id: string;
  nome_arquivo: string;
  tipo_documento: string;
  status_validacao: 'pendente' | 'aprovado' | 'rejeitado';
  caminho_arquivo: string | null;
  observacoes: string | null;
  cliente_id: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadData {
  nome_arquivo: string;
  tipo_documento: string;
  cliente_id: string;
  observacoes?: string;
}

export const useDocuments = (clientId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!clientId || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documentos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      setError(error.message);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentData: DocumentUploadData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase
        .from('documentos')
        .insert([{
          ...documentData,
          uploaded_by: user.id,
          status_validacao: 'pendente' as const
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Documento enviado com sucesso!');
      fetchDocuments(); // Recarrega a lista
      return { success: true, data };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Erro ao enviar documento');
      return { success: false, error: error.message };
    }
  };

  const getDocumentsByType = (tipo: string) => {
    return documents.filter(doc => doc.tipo_documento === tipo);
  };

  const getDocumentStats = () => {
    const total = documents.length;
    const approved = documents.filter(doc => doc.status_validacao === 'aprovado').length;
    const pending = documents.filter(doc => doc.status_validacao === 'pendente').length;
    const rejected = documents.filter(doc => doc.status_validacao === 'rejeitado').length;

    return {
      total,
      approved,
      pending,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  };

  useEffect(() => {
    fetchDocuments();
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
          table: 'documentos',
          filter: `cliente_id=eq.${clientId}`
        },
        () => {
          fetchDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    getDocumentsByType,
    getDocumentStats
  };
};