-- Adicionar campos para avatar e informações de perfil melhoradas
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN cpf TEXT,
ADD COLUMN birth_date DATE,
ADD COLUMN gender TEXT CHECK (gender IN ('M', 'F', 'NB')),
ADD COLUMN oab_number TEXT,
ADD COLUMN oab_state TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
ADD COLUMN trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '14 days'),
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN security_questions JSONB,
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN preferences JSONB DEFAULT '{}';

-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Criar políticas para o bucket de avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Função para validar CPF
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    cpf TEXT;
    digit1 INTEGER := 0;
    digit2 INTEGER := 0;
    i INTEGER;
    temp INTEGER;
BEGIN
    -- Remove formatação
    cpf := regexp_replace(cpf_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 11 dígitos
    IF length(cpf) != 11 THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica sequências inválidas
    IF cpf IN ('00000000000', '11111111111', '22222222222', '33333333333', '44444444444', 
               '55555555555', '66666666666', '77777777777', '88888888888', '99999999999') THEN
        RETURN FALSE;
    END IF;
    
    -- Calcula primeiro dígito verificador
    FOR i IN 1..9 LOOP
        digit1 := digit1 + (substring(cpf, i, 1)::INTEGER * (11 - i));
    END LOOP;
    
    temp := digit1 % 11;
    IF temp < 2 THEN
        digit1 := 0;
    ELSE
        digit1 := 11 - temp;
    END IF;
    
    -- Calcula segundo dígito verificador
    digit2 := 0;
    FOR i IN 1..10 LOOP
        digit2 := digit2 + (substring(cpf, i, 1)::INTEGER * (12 - i));
    END LOOP;
    
    temp := digit2 % 11;
    IF temp < 2 THEN
        digit2 := 0;
    ELSE
        digit2 := 11 - temp;
    END IF;
    
    -- Verifica se os dígitos calculados conferem
    RETURN substring(cpf, 10, 1)::INTEGER = digit1 AND substring(cpf, 11, 1)::INTEGER = digit2;
END;
$$;

-- Função para formatar telefone brasileiro
CREATE OR REPLACE FUNCTION public.validate_phone(phone_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    phone TEXT;
BEGIN
    -- Remove formatação
    phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Verifica se tem 10 ou 11 dígitos (com DDD)
    IF length(phone) NOT IN (10, 11) THEN
        RETURN FALSE;
    END IF;
    
    -- Verifica se começa com DDD válido (11-99)
    IF substring(phone, 1, 2)::INTEGER < 11 OR substring(phone, 1, 2)::INTEGER > 99 THEN
        RETURN FALSE;
    END IF;
    
    -- Para celular (11 dígitos), o terceiro dígito deve ser 9
    IF length(phone) = 11 AND substring(phone, 3, 1) != '9' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Trigger para atualizar último login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles 
    SET last_login = now() 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;

-- Criar trigger para atualizar último login (só se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_login_update_last_login') THEN
        CREATE TRIGGER on_auth_login_update_last_login
            AFTER INSERT ON auth.sessions
            FOR EACH ROW EXECUTE FUNCTION public.update_last_login();
    END IF;
END
$$;