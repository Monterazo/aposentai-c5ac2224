import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Download,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useRetirementTypes } from "@/hooks/useRetirementTypes";
import { useDocuments } from "@/hooks/useDocuments";
import { useAnalyses } from "@/hooks/useAnalyses";
import { toast } from "sonner";

interface RecommendationRule {
  id: string;
  name: string;
  advantage: string;
  timeToRetirement: string;
  estimatedValue: string;
  requirements: string[];
  missingDocuments: string[];
  completionPercentage: number;
  isRecommended: boolean;
}

const mockRecommendations: RecommendationRule[] = [
  {
    id: "1",
    name: "Aposentadoria por Idade (Urbana)",
    advantage: "Melhor custo-benefício considerando seu perfil atual",
    timeToRetirement: "2 anos e 4 meses",
    estimatedValue: "R$ 3.247,50",
    requirements: [
      "65 anos de idade",
      "15 anos de contribuição",
      "Documentos básicos",
      "CNIS atualizado"
    ],
    missingDocuments: ["Comprovante de residência atualizado"],
    completionPercentage: 85,
    isRecommended: true
  },
  {
    id: "2",
    name: "Regra de Transição - Pontos",
    advantage: "Maior valor de benefício",
    timeToRetirement: "3 anos e 6 meses",
    estimatedValue: "R$ 4.120,80",
    requirements: [
      "96 pontos (idade + contribuição)",
      "Mínimo 35 anos contribuição (homem)",
      "Mínimo 30 anos contribuição (mulher)"
    ],
    missingDocuments: ["Certidão de tempo de contribuição", "Declaração de IR"],
    completionPercentage: 70,
    isRecommended: false
  }
];

const administrativeSteps = [
  {
    title: "1. Preparação da Documentação",
    description: "Organize todos os documentos necessários",
    completed: true,
    substeps: [
      "Documentos pessoais básicos",
      "Comprovantes de contribuição",
      "Documentos específicos do tipo de aposentadoria"
    ]
  },
  {
    title: "2. Acesso ao Meu INSS",
    description: "Faça login na plataforma digital do INSS",
    completed: false,
    substeps: [
      "Acesse meu.inss.gov.br",
      "Faça login com CPF e senha",
      "Escolha 'Pedir Aposentadoria'"
    ]
  },
  {
    title: "3. Preenchimento do Requerimento",
    description: "Complete o formulário online",
    completed: false,
    substeps: [
      "Preencha dados pessoais",
      "Informe períodos de trabalho",
      "Anexe documentos digitalizados"
    ]
  },
  {
    title: "4. Acompanhamento do Processo",
    description: "Monitore o andamento da solicitação",
    completed: false,
    substeps: [
      "Acompanhe pelo Meu INSS",
      "Responda a eventuais exigências",
      "Prazo de análise: até 45 dias"
    ]
  }
];

export const ProfileAnalysis = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState("recommendation");
  const [isCreatingAnalysis, setIsCreatingAnalysis] = useState(false);
  
  const { retirementTypes, requirements, loading: typesLoading, getRequirementsForType } = useRetirementTypes();
  const { documents, loading: docsLoading } = useDocuments(clientId);
  const { analyses, loading: analysesLoading, createAnalysis, getLatestAnalysis } = useAnalyses(clientId);

  const latestAnalysis = getLatestAnalysis();
  const loading = typesLoading || docsLoading || analysesLoading;

  // Calcular análise automática baseada nos documentos
  const calculateAnalysis = () => {
    if (!retirementTypes.length || !requirements.length) return [];

    return retirementTypes.map(type => {
      const typeRequirements = getRequirementsForType(type.id);
      const requiredDocs = typeRequirements.filter(req => req.obrigatorio);
      const uploadedDocs = requiredDocs.filter(req => 
        documents.some(doc => doc.tipo_documento === req.nome_documento)
      );
      
      const completionPercentage = requiredDocs.length > 0 
        ? Math.round((uploadedDocs.length / requiredDocs.length) * 100) 
        : 0;

      const missingDocs = requiredDocs.filter(req => 
        !documents.some(doc => doc.tipo_documento === req.nome_documento)
      );

      // Simular cálculo de tempo e valor estimado baseado no tipo
      const timeToRetirement = getEstimatedTime(type.nome, completionPercentage);
      const estimatedValue = getEstimatedValue(type.nome, completionPercentage);

      return {
        id: type.id,
        name: type.nome,
        description: type.descricao,
        advantage: type.requisitos_gerais,
        timeToRetirement,
        estimatedValue,
        requirements: typeRequirements.map(r => r.nome_documento),
        missingDocuments: missingDocs.map(d => d.nome_documento),
        completionPercentage,
        isRecommended: completionPercentage >= 80 // Marca como recomendada se >= 80%
      };
    }).sort((a, b) => b.completionPercentage - a.completionPercentage);
  };

  const getEstimatedTime = (typeName: string, completion: number) => {
    const baseMonths = {
      'Aposentadoria por Idade': 24,
      'Aposentadoria por Tempo de Contribuição': 36,
      'Aposentadoria Especial': 18,
      'Aposentadoria da Pessoa com Deficiência': 30,
      'Aposentadoria Rural': 12
    };
    
    const months = baseMonths[typeName as keyof typeof baseMonths] || 24;
    const adjustedMonths = Math.max(6, Math.round(months * (100 - completion) / 100));
    const years = Math.floor(adjustedMonths / 12);
    const remainingMonths = adjustedMonths % 12;
    
    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} mese${remainingMonths !== 1 ? 's' : ''}`;
    }
    return `${remainingMonths} mese${remainingMonths !== 1 ? 's' : ''}`;
  };

  const getEstimatedValue = (typeName: string, completion: number) => {
    const baseValues = {
      'Aposentadoria por Idade': 3247.50,
      'Aposentadoria por Tempo de Contribuição': 4120.80,
      'Aposentadoria Especial': 5200.00,
      'Aposentadoria da Pessoa com Deficiência': 4500.00,
      'Aposentadoria Rural': 2890.00
    };
    
    const baseValue = baseValues[typeName as keyof typeof baseValues] || 3247.50;
    const adjustedValue = baseValue * (completion / 100);
    
    return adjustedValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleCreateAnalysis = async () => {
    if (!clientId) return;

    const analysisRules = calculateAnalysis();
    const recommendedRule = analysisRules.find(rule => rule.isRecommended);
    
    if (!recommendedRule) {
      toast.error('Não foi possível gerar análise. Verifique se há documentos suficientes.');
      return;
    }

    setIsCreatingAnalysis(true);
    
    const result = await createAnalysis({
      cliente_id: clientId,
      tipo_aposentadoria_id: recommendedRule.id,
      resultado_analise: `Recomendação: ${recommendedRule.name}. Completude: ${recommendedRule.completionPercentage}%`,
      observacoes: `Documentos pendentes: ${recommendedRule.missingDocuments.join(', ')}`,
      percentual_completude: recommendedRule.completionPercentage
    });

    setIsCreatingAnalysis(false);
    
    if (result.success) {
      toast.success('Análise gerada com sucesso!');
    }
  };

  const analysisRules = calculateAnalysis();
  const recommendedRule = analysisRules.find(rule => rule.isRecommended);
  const alternativeRules = analysisRules.filter(rule => !rule.isRecommended);

  if (loading) {
    return (
      <Card className="p-6 border-input-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando análise...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-input-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Análise de Perfil e Recomendação</h2>
        <div className="flex space-x-2">
          {!latestAnalysis && (
            <Button 
              onClick={handleCreateAnalysis}
              disabled={isCreatingAnalysis}
              size="sm"
            >
              {isCreatingAnalysis ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Gerar Análise
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Relatório Completo
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendation">Recomendação</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="process">Processo INSS</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendation" className="mt-6">
          {/* Recommended Rule */}
          {recommendedRule && (
            <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-primary">Aposentadoria Recomendada</h3>
                <Badge className="bg-primary text-primary-foreground">
                  Melhor Opção
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">{recommendedRule.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{recommendedRule.advantage}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo para aposentadoria:</span>
                      <span className="font-medium text-foreground">{recommendedRule.timeToRetirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor estimado:</span>
                      <span className="font-medium text-primary">{recommendedRule.estimatedValue}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Progresso da Documentação</span>
                    <span className="text-sm text-muted-foreground">{recommendedRule.completionPercentage}%</span>
                  </div>
                  <Progress value={recommendedRule.completionPercentage} className="mb-3" />
                  
                  {recommendedRule.missingDocuments.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Documentos pendentes:</p>
                      {recommendedRule.missingDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <span className="text-muted-foreground">{doc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">
                  Iniciar Processo
                </Button>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          )}

          {/* Alternative Rules */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Outras Opções Disponíveis</h3>
            {alternativeRules.map((rule) => (
              <Card key={rule.id} className="p-4 border-input-border hover:bg-accent transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-foreground">{rule.name}</h4>
                    <p className="text-sm text-muted-foreground">{rule.advantage}</p>
                  </div>
                  <Badge variant="outline">{rule.completionPercentage}% completo</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Tempo:</span>
                    <span className="ml-2 font-medium text-foreground">{rule.timeToRetirement}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="ml-2 font-medium text-foreground">{rule.estimatedValue}</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  Comparar com Recomendada
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Checklist de Pendências</h3>
              <Badge variant="outline">
                {recommendedRule ? `${recommendedRule.completionPercentage}% Completo` : 'Sem análise'}
              </Badge>
            </div>
            
            {recommendedRule ? (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Requisitos - {recommendedRule.name}</h4>
                {recommendedRule.requirements.map((req, index) => {
                  const hasDocument = documents.some(doc => doc.tipo_documento === req);
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-input-border rounded-lg">
                      {hasDocument ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      <span className="text-foreground">{req}</span>
                      <Badge className={`ml-auto ${
                        hasDocument 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {hasDocument ? "Completo" : "Pendente"}
                      </Badge>
                    </div>
                  );
                })}
                
                {recommendedRule.missingDocuments.length > 0 && (
                  <>
                    <h4 className="font-medium text-foreground mt-6">Documentos Pendentes</h4>
                    {recommendedRule.missingDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-input-border rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <span className="text-foreground">{doc}</span>
                        <Badge className="bg-amber-100 text-amber-800 ml-auto">Pendente</Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma análise disponível. Gere uma análise primeiro.
                </p>
                <Button onClick={handleCreateAnalysis} disabled={isCreatingAnalysis}>
                  {isCreatingAnalysis ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-2" />
                  )}
                  Gerar Análise
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="process" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Orientação sobre Processo Administrativo</h3>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Acessar Meu INSS
              </Button>
            </div>
            
            <div className="space-y-4">
              {administrativeSteps.map((step, index) => (
                <Card key={index} className={`p-4 ${step.completed ? 'bg-green-50 border-green-200' : 'border-input-border'}`}>
                  <div className="flex items-start space-x-3">
                    {step.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                      <Clock className="w-6 h-6 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      
                      <div className="space-y-1">
                        {step.substeps.map((substep, subIndex) => (
                          <div key={subIndex} className="flex items-center space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                            <span className="text-muted-foreground">{substep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-foreground mb-2">Informações Importantes sobre Prazos</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Análise do pedido:</strong> Até 45 dias corridos</p>
                <p>• <strong>Resposta a exigências:</strong> 30 dias (prorrogável por mais 30)</p>
                <p>• <strong>Recurso administrativo:</strong> 30 dias após decisão</p>
                <p>• <strong>Recurso judicial:</strong> Após esgotamento da via administrativa</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};