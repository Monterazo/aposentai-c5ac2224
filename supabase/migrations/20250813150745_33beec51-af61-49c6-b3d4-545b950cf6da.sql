-- Populando dados básicos se não existirem

-- Inserir tipos de aposentadoria se não existirem
INSERT INTO tipos_aposentadoria (nome, descricao, requisitos_gerais) VALUES
('Aposentadoria por Idade', 'Aposentadoria concedida por critério de idade mínima', 'Idade mínima de 65 anos para homens e 62 anos para mulheres'),
('Aposentadoria por Tempo de Contribuição', 'Aposentadoria baseada no tempo de contribuição ao INSS', 'Tempo mínimo de contribuição conforme regras vigentes'),
('Aposentadoria Especial', 'Aposentadoria para atividades insalubres ou perigosas', 'Comprovação de atividade especial por período determinado'),
('Aposentadoria da Pessoa com Deficiência', 'Aposentadoria específica para pessoas com deficiência', 'Comprovação de deficiência e tempo de contribuição reduzido'),
('Aposentadoria Rural', 'Aposentadoria para trabalhadores rurais', 'Comprovação de atividade rural em regime de economia familiar')
ON CONFLICT (nome) DO NOTHING;

-- Inserir requisitos de documentos se não existirem
DO $$
DECLARE
    tipo_idade_id UUID;
    tipo_tempo_id UUID;
    tipo_especial_id UUID;
    tipo_deficiencia_id UUID;
    tipo_rural_id UUID;
BEGIN
    -- Buscar IDs dos tipos
    SELECT id INTO tipo_idade_id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade' LIMIT 1;
    SELECT id INTO tipo_tempo_id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição' LIMIT 1;
    SELECT id INTO tipo_especial_id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Especial' LIMIT 1;
    SELECT id INTO tipo_deficiencia_id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria da Pessoa com Deficiência' LIMIT 1;
    SELECT id INTO tipo_rural_id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural' LIMIT 1;

    -- Documentos para Aposentadoria por Idade
    IF tipo_idade_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id) VALUES
        ('RG e CPF', 'Documento de identidade e CPF', true, tipo_idade_id),
        ('Comprovante de Residência', 'Comprovante de residência atualizado', true, tipo_idade_id),
        ('Carteira de Trabalho', 'Carteira de trabalho completa', true, tipo_idade_id),
        ('CNIS', 'Cadastro Nacional de Informações Sociais', true, tipo_idade_id),
        ('Certidão de Nascimento', 'Certidão de nascimento ou casamento', true, tipo_idade_id)
        ON CONFLICT (nome_documento, tipo_aposentadoria_id) DO NOTHING;
    END IF;

    -- Documentos para Aposentadoria por Tempo de Contribuição
    IF tipo_tempo_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id) VALUES
        ('RG e CPF', 'Documento de identidade e CPF', true, tipo_tempo_id),
        ('Carteira de Trabalho', 'Carteira de trabalho completa', true, tipo_tempo_id),
        ('CNIS', 'Cadastro Nacional de Informações Sociais', true, tipo_tempo_id),
        ('Declaração IR', 'Declaração de Imposto de Renda', false, tipo_tempo_id),
        ('Carnês de Contribuição', 'GPS e carnês de contribuição autônoma', false, tipo_tempo_id)
        ON CONFLICT (nome_documento, tipo_aposentadoria_id) DO NOTHING;
    END IF;

    -- Documentos para Aposentadoria Especial
    IF tipo_especial_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id) VALUES
        ('PPP', 'Perfil Profissiográfico Previdenciário', true, tipo_especial_id),
        ('LTCAT', 'Laudo Técnico das Condições do Ambiente de Trabalho', true, tipo_especial_id),
        ('CNIS', 'Cadastro Nacional de Informações Sociais', true, tipo_especial_id),
        ('Carteira de Trabalho', 'Carteira de trabalho completa', true, tipo_especial_id)
        ON CONFLICT (nome_documento, tipo_aposentadoria_id) DO NOTHING;
    END IF;

    -- Documentos para Pessoa com Deficiência
    IF tipo_deficiencia_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id) VALUES
        ('Laudo Médico', 'Laudo médico comprovando deficiência', true, tipo_deficiencia_id),
        ('Relatório Médico', 'Relatório médico detalhado', true, tipo_deficiencia_id),
        ('CNIS', 'Cadastro Nacional de Informações Sociais', true, tipo_deficiencia_id),
        ('Carteira de Trabalho', 'Carteira de trabalho completa', true, tipo_deficiencia_id)
        ON CONFLICT (nome_documento, tipo_aposentadoria_id) DO NOTHING;
    END IF;

    -- Documentos para Aposentadoria Rural
    IF tipo_rural_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id) VALUES
        ('Declaração de Aptidão PRONAF', 'DAP - Declaração de Aptidão ao PRONAF', true, tipo_rural_id),
        ('Comprovante Atividade Rural', 'Documentos que comprovem atividade rural', true, tipo_rural_id),
        ('Bloco de Notas Produtor Rural', 'Bloco de notas do produtor rural', false, tipo_rural_id),
        ('Declaração do Sindicato', 'Declaração do sindicato rural', false, tipo_rural_id)
        ON CONFLICT (nome_documento, tipo_aposentadoria_id) DO NOTHING;
    END IF;
END $$;