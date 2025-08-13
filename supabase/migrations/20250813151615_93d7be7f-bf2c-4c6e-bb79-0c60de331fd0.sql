-- Remove as políticas RLS existentes da tabela clientes
DROP POLICY IF EXISTS "Users can create their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can delete their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can update their own clients" ON public.clientes;
DROP POLICY IF EXISTS "Users can view their own clients" ON public.clientes;

-- Cria políticas RLS mais seguras baseadas em entidade e usuário
CREATE POLICY "Users can view clients from their entities or own clients" 
ON public.clientes 
FOR SELECT 
USING (
  -- Usuário pode ver clientes de entidades que ele possui
  (entidade_id IN (
    SELECT id FROM public.entidades 
    WHERE owner_id = auth.uid()
  ))
  OR
  -- OU clientes que ele próprio criou (para compatibilidade)
  (user_id = auth.uid())
);

CREATE POLICY "Users can create clients for their entities" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
  -- Usuário deve ser o criador
  (user_id = auth.uid())
  AND
  -- E a entidade deve ser dele OU entidade_id pode ser nula (para compatibilidade)
  (
    entidade_id IS NULL 
    OR 
    entidade_id IN (
      SELECT id FROM public.entidades 
      WHERE owner_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can update clients from their entities or own clients" 
ON public.clientes 
FOR UPDATE 
USING (
  -- Mesma lógica do SELECT - usuário pode editar clientes de suas entidades ou próprios
  (entidade_id IN (
    SELECT id FROM public.entidades 
    WHERE owner_id = auth.uid()
  ))
  OR
  (user_id = auth.uid())
);

CREATE POLICY "Users can delete clients from their entities or own clients" 
ON public.clientes 
FOR DELETE 
USING (
  -- Mesma lógica do SELECT - usuário pode deletar clientes de suas entidades ou próprios
  (entidade_id IN (
    SELECT id FROM public.entidades 
    WHERE owner_id = auth.uid()
  ))
  OR
  (user_id = auth.uid())
);

-- Adiciona índices para melhor performance das consultas RLS
CREATE INDEX IF NOT EXISTS idx_clientes_entidade_id ON public.clientes(entidade_id);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_entidades_owner_id ON public.entidades(owner_id);