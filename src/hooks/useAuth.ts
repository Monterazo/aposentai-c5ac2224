import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from our database
          setTimeout(async () => {
            await fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar perfil do usuário');
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'advogado' | 'usuario_comum' = 'usuario_comum') => {
    try {
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
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
        toast.success('Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');
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
          await supabase.auth.signOut();
          toast.error('Usuário não autorizado. Entre em contato com o administrador.');
          return { success: false, error: 'Usuário não autorizado' };
        }

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