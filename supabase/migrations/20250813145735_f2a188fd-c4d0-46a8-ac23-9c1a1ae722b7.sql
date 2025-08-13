-- Criar função para criar entidade automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.create_default_entity_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar entidade padrão para o usuário
  INSERT INTO public.entidades (
    owner_id,
    nome_fantasia,
    email,
    tipo
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Minha Empresa'),
    NEW.email,
    'escritorio'::entity_type
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para criar entidade automaticamente
CREATE TRIGGER on_auth_user_created_entity
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_entity_for_user();