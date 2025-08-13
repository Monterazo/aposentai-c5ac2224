import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'NB';
  oab_number?: string;
  oab_state?: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_start_date?: string;
  trial_end_date?: string;
  last_login?: string;
  two_factor_enabled: boolean;
  preferences: any;
  role: 'advogado' | 'usuario_comum';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'NB';
  oab_number?: string;
  oab_state?: string;
  preferences?: any;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(data as UserProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      fetchProfile(); // Recarrega o perfil
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
      return { success: false, error: error.message };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar perfil com a nova URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar atualizado com sucesso!');
      fetchProfile();
      return { success: true, url: data.publicUrl };
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Erro ao fazer upload do avatar');
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error('Erro ao alterar senha');
      return { success: false, error: error.message };
    }
  };

  const toggleTwoFactor = async (enabled: boolean) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`Autenticação de dois fatores ${enabled ? 'ativada' : 'desativada'}!`);
      fetchProfile();
      return { success: true };
    } catch (error: any) {
      console.error('Error toggling 2FA:', error);
      toast.error('Erro ao alterar autenticação de dois fatores');
      return { success: false, error: error.message };
    }
  };

  const getTrialDaysRemaining = () => {
    if (!profile?.trial_end_date) return 0;
    
    const endDate = new Date(profile.trial_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const isTrialExpired = () => {
    return getTrialDaysRemaining() <= 0 && profile?.subscription_status === 'trial';
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // Configurar realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    toggleTwoFactor,
    getTrialDaysRemaining,
    isTrialExpired
  };
};