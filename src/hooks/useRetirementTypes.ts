import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RetirementType {
  id: string;
  nome: string;
  descricao: string;
  requisitos_gerais: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentRequirement {
  id: string;
  nome_documento: string;
  obrigatorio: boolean;
  descricao: string;
  tipo_aposentadoria_id: string;
}

export const useRetirementTypes = () => {
  const [retirementTypes, setRetirementTypes] = useState<RetirementType[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRetirementTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: typesData, error: typesError } = await supabase
        .from('tipos_aposentadoria')
        .select('*')
        .order('nome');

      if (typesError) throw typesError;

      const { data: requirementsData, error: requirementsError } = await supabase
        .from('requisitos_documentos')
        .select('*')
        .order('nome_documento');

      if (requirementsError) throw requirementsError;

      setRetirementTypes(typesData || []);
      setRequirements(requirementsData || []);
    } catch (error: any) {
      console.error('Error fetching retirement types:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRequirementsForType = (typeId: string) => {
    return requirements.filter(req => req.tipo_aposentadoria_id === typeId);
  };

  const getRequiredDocuments = (typeId: string) => {
    return requirements.filter(req => req.tipo_aposentadoria_id === typeId && req.obrigatorio);
  };

  const getOptionalDocuments = (typeId: string) => {
    return requirements.filter(req => req.tipo_aposentadoria_id === typeId && !req.obrigatorio);
  };

  useEffect(() => {
    fetchRetirementTypes();
  }, []);

  return {
    retirementTypes,
    requirements,
    loading,
    error,
    fetchRetirementTypes,
    getRequirementsForType,
    getRequiredDocuments,
    getOptionalDocuments
  };
};