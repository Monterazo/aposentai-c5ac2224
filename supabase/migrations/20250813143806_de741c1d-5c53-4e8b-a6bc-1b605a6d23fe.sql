-- Inserir requisitos de documentos para os tipos de aposentadoria
INSERT INTO requisitos_documentos (tipo_aposentadoria_id, nome_documento, obrigatorio, descricao) VALUES
-- Aposentadoria por Idade
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade'), 'RG e CPF', true, 'Documento de identidade e CPF válidos'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade'), 'Comprovante de Residência', true, 'Comprovante atual de residência'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade'), 'Carteira de Trabalho', true, 'CTPS ou documento equivalente'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade'), 'CNIS', true, 'Cadastro Nacional de Informações Sociais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Idade'), 'Certidão de Nascimento', true, 'Certidão de nascimento ou casamento'),

-- Aposentadoria por Tempo de Contribuição
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição'), 'RG e CPF', true, 'Documento de identidade e CPF válidos'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição'), 'Carteira de Trabalho', true, 'CTPS completa'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição'), 'CNIS', true, 'Cadastro Nacional de Informações Sociais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição'), 'Carnês de Contribuição', false, 'GPS e carnês de contribuição autônoma'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria por Tempo de Contribuição'), 'Declaração de IR', false, 'Declarações de Imposto de Renda'),

-- Aposentadoria Especial
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Especial'), 'PPP', true, 'Perfil Profissiográfico Previdenciário'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Especial'), 'LTCAT', true, 'Laudo Técnico de Condições Ambientais do Trabalho'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Especial'), 'CNIS', true, 'Cadastro Nacional de Informações Sociais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Especial'), 'Carteira de Trabalho', true, 'CTPS com registros das atividades especiais'),

-- Aposentadoria da Pessoa com Deficiência
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria da Pessoa com Deficiência'), 'Relatório Médico', true, 'Relatório médico detalhado da deficiência'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria da Pessoa com Deficiência'), 'Avaliação Social', true, 'Avaliação social da deficiência'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria da Pessoa com Deficiência'), 'CNIS', true, 'Cadastro Nacional de Informações Sociais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria da Pessoa com Deficiência'), 'Carteira de Trabalho', true, 'CTPS completa'),

-- Aposentadoria Rural
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural'), 'Autodeclaração', true, 'Autodeclaração de atividade rural'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural'), 'Notas Fiscais', false, 'Notas fiscais de venda de produtos rurais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural'), 'Declaração Sindical', false, 'Declaração do sindicato rural'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural'), 'CNIS', true, 'Cadastro Nacional de Informações Sociais'),
((SELECT id FROM tipos_aposentadoria WHERE nome = 'Aposentadoria Rural'), 'ITR', false, 'Declaração do Imposto Territorial Rural');

-- Habilitar realtime para as tabelas principais
ALTER TABLE public.clientes REPLICA IDENTITY FULL;
ALTER TABLE public.documentos REPLICA IDENTITY FULL;
ALTER TABLE public.analises REPLICA IDENTITY FULL;