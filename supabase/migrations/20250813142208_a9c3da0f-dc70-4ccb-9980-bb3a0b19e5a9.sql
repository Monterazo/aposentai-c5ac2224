-- Adiciona coluna user_id na tabela clientes
ALTER TABLE public.clientes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualiza clientes existentes para vincular ao owner da entidade
UPDATE public.clientes 
SET user_id = (
  SELECT e.owner_id 
  FROM public.entidades e 
  WHERE e.id = clientes.entidade_id
);

-- Remove as políticas RLS antigas
DROP POLICY IF EXISTS "Users can create clients for their entities" ON public.clientes;
DROP POLICY IF EXISTS "Users can view clients of their entities" ON public.clientes;
DROP POLICY IF EXISTS "Users can update clients of their entities" ON public.clientes;

-- Cria novas políticas RLS baseadas no user_id
CREATE POLICY "Users can view their own clients" 
ON public.clientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients" 
ON public.clientes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients" 
ON public.clientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Atualiza as políticas das análises para usar user_id diretamente
DROP POLICY IF EXISTS "Users can create analyses for their clients" ON public.analises;
DROP POLICY IF EXISTS "Users can view analyses of their clients" ON public.analises;

CREATE POLICY "Users can create analyses for their clients" 
ON public.analises 
FOR INSERT 
WITH CHECK (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE user_id = auth.uid()
  ) 
  AND analista_id = auth.uid()
);

CREATE POLICY "Users can view analyses of their clients" 
ON public.analises 
FOR SELECT 
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE user_id = auth.uid()
  )
);

-- Atualiza as políticas dos documentos para usar user_id diretamente
DROP POLICY IF EXISTS "Users can create documents for their clients" ON public.documentos;
DROP POLICY IF EXISTS "Users can view documents of their clients" ON public.documentos;

CREATE POLICY "Users can create documents for their clients" 
ON public.documentos 
FOR INSERT 
WITH CHECK (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE user_id = auth.uid()
  ) 
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Users can view documents of their clients" 
ON public.documentos 
FOR SELECT 
USING (
  cliente_id IN (
    SELECT id FROM public.clientes 
    WHERE user_id = auth.uid()
  )
);