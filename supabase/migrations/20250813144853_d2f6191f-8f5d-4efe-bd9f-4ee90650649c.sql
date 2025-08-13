-- Corrigir funções com search_path adequado
CREATE OR REPLACE FUNCTION public.validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Corrigir função de validação de telefone
CREATE OR REPLACE FUNCTION public.validate_phone(phone_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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