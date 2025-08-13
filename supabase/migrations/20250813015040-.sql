-- Criação da estrutura do banco de dados AposentAI
-- Baseado na documentação de arquitetura fornecida

-- Enum para tipos de usuários
CREATE TYPE public.user_role AS ENUM ('admin', 'advogado', 'usuario_comum');

-- Enum para status de validação de documentos
CREATE TYPE public.validation_status AS ENUM ('pendente', 'aprovado', 'rejeitado');

-- Enum para tipos de entidade
CREATE TYPE public.entity_type AS ENUM ('advogado_solo', 'escritorio');

-- Tabela de perfis de usuários (extensão do auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'usuario_comum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de entidades (escritórios ou advogados solo)
CREATE TABLE public.entidades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_fantasia TEXT NOT NULL,
  tipo entity_type NOT NULL,
  cnpj TEXT,
  oab_numero TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  rg TEXT,
  data_nascimento DATE NOT NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  entidade_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de tipos de aposentadoria
CREATE TABLE public.tipos_aposentadoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  requisitos_gerais TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de requisitos de documentos por tipo de aposentadoria
CREATE TABLE public.requisitos_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_documento TEXT NOT NULL,
  obrigatorio BOOLEAN NOT NULL DEFAULT true,
  descricao TEXT,
  tipo_aposentadoria_id UUID NOT NULL REFERENCES public.tipos_aposentadoria(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de documentos
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_arquivo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  status_validacao validation_status NOT NULL DEFAULT 'pendente',
  caminho_arquivo TEXT,
  observacoes TEXT,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de análises
CREATE TABLE public.analises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resultado_analise TEXT,
  observacoes TEXT,
  percentual_completude INTEGER DEFAULT 0,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_aposentadoria_id UUID REFERENCES public.tipos_aposentadoria(id),
  analista_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de alertas
CREATE TABLE public.alertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  lido BOOLEAN NOT NULL DEFAULT false,
  documento_id UUID REFERENCES public.documentos(id),
  cliente_id UUID REFERENCES public.clientes(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de assinaturas/planos
CREATE TABLE public.assinaturas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo',
  valor DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  stripe_subscription_id TEXT,
  entidade_id UUID NOT NULL REFERENCES public.entidades(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir tipos de aposentadoria padrão
INSERT INTO public.tipos_aposentadoria (nome, descricao, requisitos_gerais) VALUES
('Aposentadoria por Idade', 'Aposentadoria concedida por critério de idade mínima', 'Idade mínima de 65 anos para homens e 62 anos para mulheres'),
('Aposentadoria por Tempo de Contribuição', 'Aposentadoria baseada no tempo de contribuição ao INSS', 'Tempo mínimo de contribuição conforme regras vigentes'),
('Aposentadoria Especial', 'Aposentadoria para atividades insalubres ou perigosas', 'Comprovação de atividade especial por período determinado'),
('Aposentadoria da Pessoa com Deficiência', 'Aposentadoria específica para pessoas com deficiência', 'Comprovação de deficiência e tempo de contribuição reduzido'),
('Aposentadoria Rural', 'Aposentadoria para trabalhadores rurais', 'Comprovação de atividade rural em regime de economia familiar');

-- Habilitar Row Level Security em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_aposentadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitos_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para entidades
CREATE POLICY "Users can view their own entities" ON public.entidades
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own entities" ON public.entidades
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own entities" ON public.entidades
  FOR UPDATE USING (auth.uid() = owner_id);

-- Políticas RLS para clientes
CREATE POLICY "Users can view clients of their entities" ON public.clientes
  FOR SELECT USING (
    entidade_id IN (
      SELECT id FROM public.entidades WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create clients for their entities" ON public.clientes
  FOR INSERT WITH CHECK (
    entidade_id IN (
      SELECT id FROM public.entidades WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update clients of their entities" ON public.clientes
  FOR UPDATE USING (
    entidade_id IN (
      SELECT id FROM public.entidades WHERE owner_id = auth.uid()
    )
  );

-- Políticas RLS para documentos
CREATE POLICY "Users can view documents of their clients" ON public.documentos
  FOR SELECT USING (
    cliente_id IN (
      SELECT c.id FROM public.clientes c
      JOIN public.entidades e ON c.entidade_id = e.id
      WHERE e.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents for their clients" ON public.documentos
  FOR INSERT WITH CHECK (
    cliente_id IN (
      SELECT c.id FROM public.clientes c
      JOIN public.entidades e ON c.entidade_id = e.id
      WHERE e.owner_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

-- Políticas RLS para análises
CREATE POLICY "Users can view analyses of their clients" ON public.analises
  FOR SELECT USING (
    cliente_id IN (
      SELECT c.id FROM public.clientes c
      JOIN public.entidades e ON c.entidade_id = e.id
      WHERE e.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create analyses for their clients" ON public.analises
  FOR INSERT WITH CHECK (
    cliente_id IN (
      SELECT c.id FROM public.clientes c
      JOIN public.entidades e ON c.entidade_id = e.id
      WHERE e.owner_id = auth.uid()
    ) AND analista_id = auth.uid()
  );

-- Políticas RLS para alertas
CREATE POLICY "Users can view their own alerts" ON public.alertas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.alertas
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para assinaturas
CREATE POLICY "Users can view subscriptions of their entities" ON public.assinaturas
  FOR SELECT USING (
    entidade_id IN (
      SELECT id FROM public.entidades WHERE owner_id = auth.uid()
    )
  );

-- Tipos de aposentadoria são públicos para leitura
CREATE POLICY "Everyone can view retirement types" ON public.tipos_aposentadoria
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view document requirements" ON public.requisitos_documentos
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entidades_updated_at BEFORE UPDATE ON public.entidades
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipos_aposentadoria_updated_at BEFORE UPDATE ON public.tipos_aposentadoria
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_requisitos_documentos_updated_at BEFORE UPDATE ON public.requisitos_documentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documentos_updated_at BEFORE UPDATE ON public.documentos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analises_updated_at BEFORE UPDATE ON public.analises
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON public.alertas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assinaturas_updated_at BEFORE UPDATE ON public.assinaturas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar profile automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'usuario_comum')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();