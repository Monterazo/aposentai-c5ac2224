-- Corrigir inserção de dados sem constraint de conflito
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

    -- Documentos para Aposentadoria por Idade (só inserir se não existir)
    IF tipo_idade_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'RG e CPF', 'Documento de identidade e CPF', true, tipo_idade_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'RG e CPF' AND tipo_aposentadoria_id = tipo_idade_id);
        
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'Comprovante de Residência', 'Comprovante de residência atualizado', true, tipo_idade_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'Comprovante de Residência' AND tipo_aposentadoria_id = tipo_idade_id);
        
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'Carteira de Trabalho', 'Carteira de trabalho completa', true, tipo_idade_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'Carteira de Trabalho' AND tipo_aposentadoria_id = tipo_idade_id);
        
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'CNIS', 'Cadastro Nacional de Informações Sociais', true, tipo_idade_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'CNIS' AND tipo_aposentadoria_id = tipo_idade_id);
    END IF;

    -- Documentos para Aposentadoria Especial (só inserir se não existir)
    IF tipo_especial_id IS NOT NULL THEN
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'PPP', 'Perfil Profissiográfico Previdenciário', true, tipo_especial_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'PPP' AND tipo_aposentadoria_id = tipo_especial_id);
        
        INSERT INTO requisitos_documentos (nome_documento, descricao, obrigatorio, tipo_aposentadoria_id)
        SELECT 'LTCAT', 'Laudo Técnico das Condições do Ambiente de Trabalho', true, tipo_especial_id
        WHERE NOT EXISTS (SELECT 1 FROM requisitos_documentos WHERE nome_documento = 'LTCAT' AND tipo_aposentadoria_id = tipo_especial_id);
    END IF;
END $$;