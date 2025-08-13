import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calculator, Download, TrendingUp, Clock, DollarSign, Loader2 } from "lucide-react";
import { useRetirementTypes } from "@/hooks/useRetirementTypes";
import { useDocuments } from "@/hooks/useDocuments";

interface SimulationRule {
  id: string;
  name: string;
  description: string;
  timeRemaining: string;
  estimatedDate: string;
  estimatedValue: string;
  progress: number;
  isRecommended?: boolean;
}

const mockSimulations: SimulationRule[] = [
  {
    id: "1",
    name: "Aposentadoria por Idade (Urbana)",
    description: "65 anos de idade + 15 anos de contribuição",
    timeRemaining: "2 anos e 4 meses", 
    estimatedDate: "Mai/2026",
    estimatedValue: "R$ 3.247,50",
    progress: 78,
    isRecommended: true
  },
  {
    id: "2", 
    name: "Aposentadoria por Idade (Rural)",
    description: "60 anos de idade + 15 anos de contribuição rural",
    timeRemaining: "4 anos e 8 meses",
    estimatedDate: "Set/2028", 
    estimatedValue: "R$ 2.890,00",
    progress: 65
  },
  {
    id: "3",
    name: "Aposentadoria Híbrida (Rural + Urbana)",
    description: "65 anos + 15 anos (rural + urbano)",
    timeRemaining: "1 ano e 2 meses",
    estimatedDate: "Mar/2025",
    estimatedValue: "R$ 3.455,20", 
    progress: 92
  },
  {
    id: "4",
    name: "Regra de Transição (2019) - Pontos",
    description: "96 pontos (idade + tempo contribuição)",
    timeRemaining: "3 anos e 6 meses",
    estimatedDate: "Jul/2027",
    estimatedValue: "R$ 4.120,80",
    progress: 68
  },
  {
    id: "5",
    name: "Aposentadoria Especial",
    description: "25 anos de atividade especial + 60 anos",
    timeRemaining: "Documentos insuficientes",
    estimatedDate: "Verificar PPP/LTCAT",
    estimatedValue: "R$ 5.200,00",
    progress: 45
  },
  {
    id: "6",
    name: "Aposentadoria por Incapacidade",
    description: "Incapacidade permanente para o trabalho",
    timeRemaining: "Avaliação médica",
    estimatedDate: "Depende de perícia",
    estimatedValue: "R$ 3.800,00",
    progress: 0
  },
  {
    id: "7",
    name: "Aposentadoria - Pessoa com Deficiência",
    description: "25 anos contribuição + deficiência comprovada",
    timeRemaining: "Documentos insuficientes",
    estimatedDate: "Verificar relatórios médicos",
    estimatedValue: "R$ 4.500,00",
    progress: 30
  },
  {
    id: "8",
    name: "Aposentadoria do Professor",
    description: "25 anos magistério + 60 anos (mulher) / 65 (homem)",
    timeRemaining: "8 anos e 2 meses",
    estimatedDate: "Jan/2032",
    estimatedValue: "R$ 3.650,00",
    progress: 55
  }
];

export const RetirementSimulation = () => {
  const { clientId } = useParams();
  const { retirementTypes, requirements, loading: typesLoading, getRequirementsForType } = useRetirementTypes();
  const { documents, loading: docsLoading } = useDocuments(clientId);
  
  const loading = typesLoading || docsLoading;

  // Gerar simulações baseadas nos dados reais
  const generateSimulations = (): SimulationRule[] => {
    if (!retirementTypes.length || !requirements.length) return [];

    return retirementTypes.map(type => {
      const typeRequirements = getRequirementsForType(type.id);
      const requiredDocs = typeRequirements.filter(req => req.obrigatorio);
      const uploadedDocs = requiredDocs.filter(req => 
        documents.some(doc => doc.tipo_documento === req.nome_documento)
      );
      
      const progress = requiredDocs.length > 0 
        ? Math.round((uploadedDocs.length / requiredDocs.length) * 100) 
        : 0;

      // Calcular tempo estimado baseado no progresso e tipo
      const getTimeRemaining = () => {
        if (progress === 0) return "Documentos insuficientes";
        
        const baseMonths = {
          'Aposentadoria por Idade': 24,
          'Aposentadoria por Tempo de Contribuição': 36,
          'Aposentadoria Especial': 18,
          'Aposentadoria da Pessoa com Deficiência': 30,
          'Aposentadoria Rural': 12
        };
        
        const months = baseMonths[type.nome as keyof typeof baseMonths] || 24;
        const adjustedMonths = Math.max(3, Math.round(months * (100 - progress) / 100));
        const years = Math.floor(adjustedMonths / 12);
        const remainingMonths = adjustedMonths % 12;
        
        if (years > 0) {
          return `${years} ano${years > 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
        }
        return `${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
      };

      // Calcular data estimada
      const getEstimatedDate = () => {
        if (progress === 0) return "Verificar documentos";
        
        const timeStr = getTimeRemaining();
        const monthsMatch = timeStr.match(/(\d+)\s+mês/);
        const yearsMatch = timeStr.match(/(\d+)\s+ano/);
        
        const months = (yearsMatch ? parseInt(yearsMatch[1]) * 12 : 0) + 
                     (monthsMatch ? parseInt(monthsMatch[1]) : 0);
        
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + months);
        
        return futureDate.toLocaleDateString('pt-BR', { 
          month: 'short', 
          year: 'numeric' 
        });
      };

      // Calcular valor estimado
      const getEstimatedValue = () => {
        const baseValues = {
          'Aposentadoria por Idade': 3247.50,
          'Aposentadoria por Tempo de Contribuição': 4120.80,
          'Aposentadoria Especial': 5200.00,
          'Aposentadoria da Pessoa com Deficiência': 4500.00,
          'Aposentadoria Rural': 2890.00
        };
        
        const baseValue = baseValues[type.nome as keyof typeof baseValues] || 3247.50;
        return baseValue.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      };

      return {
        id: type.id,
        name: type.nome,
        description: type.requisitos_gerais,
        timeRemaining: getTimeRemaining(),
        estimatedDate: getEstimatedDate(),
        estimatedValue: getEstimatedValue(),
        progress,
        isRecommended: progress >= 80 // Marca como recomendada se >= 80%
      };
    }).sort((a, b) => b.progress - a.progress);
  };

  const simulations = generateSimulations();
  const [selectedRule, setSelectedRule] = useState<string>(simulations[0]?.id || '');
  const recommendedRule = simulations.find(rule => rule.isRecommended);

  if (loading) {
    return (
      <Card className="p-6 border-input-border">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Carregando simulações...</span>
        </div>
      </Card>
    );
  }

  if (simulations.length === 0) {
    return (
      <Card className="p-6 border-input-border">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Nenhuma simulação disponível. Cadastre tipos de aposentadoria primeiro.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-input-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Simulação de Aposentadoria</h2>
        <Button variant="outline" size="sm">
          <Calculator className="w-4 h-4 mr-2" />
          Atualizar Simulação
        </Button>
      </div>

      {/* Recommended Rule Highlight */}
      {recommendedRule && (
        <Card className="p-4 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-primary">Regra Recomendada</h3>
          </div>
          <p className="text-sm text-foreground mb-3">
            <strong>{recommendedRule.name}</strong> - Melhor custo-benefício
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Tempo restante</p>
              <p className="font-medium text-foreground">{recommendedRule.timeRemaining}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data estimada</p>
              <p className="font-medium text-foreground">{recommendedRule.estimatedDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Valor estimado</p>
              <p className="font-medium text-primary">{recommendedRule.estimatedValue}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Simulation Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-foreground">Todas as Modalidades</h3>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {simulations.map((simulation) => (
          <Card 
            key={simulation.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedRule === simulation.id 
                ? "border-primary bg-primary/5" 
                : "border-input-border hover:bg-accent"
            }`}
            onClick={() => setSelectedRule(simulation.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-foreground">{simulation.name}</h4>
                  {simulation.isRecommended && (
                    <Badge className="bg-primary text-primary-foreground text-xs">
                      Recomendada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{simulation.description}</p>
              </div>
              
              {simulation.progress > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{simulation.progress}%</p>
                  <p className="text-xs text-muted-foreground">Completo</p>
                </div>
              )}
            </div>

            {simulation.progress > 0 && (
              <div className="mb-3">
                <Progress value={simulation.progress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Tempo restante</p>
                  <p className="font-medium text-foreground">{simulation.timeRemaining}</p>
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground">Data estimada</p>
                <p className="font-medium text-foreground">{simulation.estimatedDate}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Valor estimado</p>
                  <p className="font-medium text-foreground">{simulation.estimatedValue}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
};