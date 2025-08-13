-- Adicionar campos para dados de simulação no perfil do cliente
ALTER TABLE public.clientes 
ADD COLUMN data_nascimento_simulacao date,
ADD COLUMN genero_simulacao text,
ADD COLUMN data_inicio_contribuicao_simulacao date,
ADD COLUMN salario_atual_simulacao numeric,
ADD COLUMN trabalho_rural_simulacao boolean DEFAULT false,
ADD COLUMN trabalho_especial_simulacao boolean DEFAULT false,
ADD COLUMN professor_simulacao boolean DEFAULT false,
ADD COLUMN anos_trabalho_especial_simulacao integer DEFAULT 0,
ADD COLUMN anos_trabalho_rural_simulacao integer DEFAULT 0,
ADD COLUMN anos_magisterio_simulacao integer DEFAULT 0,
ADD COLUMN ultima_simulacao_data timestamp with time zone;