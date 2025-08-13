import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'advogado' | 'usuario_comum';
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        console.log('Profile found:', profile);
        const userProfile = {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role
        };
        setUser(userProfile);
        console.log('User state updated:', userProfile);
      } else {
        console.log('No profile found for user');
        setUser(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to prevent blocking the auth state change
          setTimeout(() => {
            if (mounted) {
              fetchUserProfile(session.user.id);
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'advogado' | 'usuario_comum' = 'usuario_comum') => {
    try {
      setLoading(true);
      
      // Para desenvolvimento, não exigir confirmação de email
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success('Cadastro realizado com sucesso! Você já pode fazer login.');
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error: any) {
      toast.error('Erro ao criar conta');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Credenciais inválidas ou usuário não encontrado');
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user has a profile (is registered in our system)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile) {
          // User exists in auth but not in our system
          console.log('User not found in profiles table:', profileError);
          await supabase.auth.signOut();
          toast.error('Usuário não autorizado. Entre em contato com o administrador.');
          return { success: false, error: 'Usuário não autorizado' };
        }

        console.log('Login successful, profile found:', profile);
        
        // Don't manually set user here - let onAuthStateChange handle it
        toast.success('Login realizado com sucesso!');
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error: any) {
      toast.error('Erro ao fazer login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Erro ao sair');
        return { success: false };
      }

      setUser(null);
      setSession(null);
      toast.success('Logout realizado com sucesso!');
      return { success: true };
    } catch (error) {
      toast.error('Erro ao sair');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };
};