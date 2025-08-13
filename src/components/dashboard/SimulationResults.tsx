import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Download,
  RotateCcw
} from "lucide-react";

interface RetirementResult {
  type: string;
  description: string;
  requiredAge: number;
  requiredContribution: number;
  currentAge: number;
  currentContribution: number;
  yearsUntilRetirement: number;
  monthsUntilRetirement: number;
  estimatedValue: number;
  canRetireNow: boolean;
  rule: string;
  minimumPoints?: number;
  currentPoints?: number;
}

interface SimulationResultsProps {
  results: RetirementResult[];
  onNewSimulation: () => void;
}

export const SimulationResults = ({ results, onNewSimulation }: SimulationResultsProps) => {
  const bestOption = results.find(r => r.canRetireNow) || results[0];
  
  const formatTimeRemaining = (years: number, months: number) => {
    if (years === 0 && months === 0) return "Pode se aposentar agora";
    if (years === 0) return `${months} mês${months !== 1 ? 'es' : ''}`;
    if (months === 0) return `${years} ano${years !== 1 ? 's' : ''}`;
    return `${years} ano${years !== 1 ? 's' : ''} e ${months % 12} mês${(months % 12) !== 1 ? 'es' : ''}`;
  };

  const calculateProgress = (result: RetirementResult) => {
    const ageProgress = (result.currentAge / result.requiredAge) * 100;
    const contributionProgress = (result.currentContribution / result.requiredContribution) * 100;
    return Math.min(100, (ageProgress + contributionProgress) / 2);
  };

  const exportResults = () => {
    // Aqui você implementaria a exportação para PDF
    console.log("Exportando resultados...");
  };

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Resultados da Simulação</h2>
          <p className="text-muted-foreground">
            Baseado na Emenda Constitucional 103/2019 (Nova Previdência)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportResults}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={onNewSimulation}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Nova Simulação
          </Button>
        </div>
      </div>

      {/* Melhor opção destacada */}
      {bestOption && (
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">
              {bestOption.canRetireNow ? "Você pode se aposentar agora!" : "Melhor Opção"}
            </h3>
            {bestOption.canRetireNow && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Elegível
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Modalidade</p>
              <p className="font-semibold text-foreground">{bestOption.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tempo restante</p>
              <p className="font-semibold text-foreground">
                {formatTimeRemaining(bestOption.yearsUntilRetirement, bestOption.monthsUntilRetirement)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor estimado</p>
              <p className="font-semibold text-primary">
                {bestOption.estimatedValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Base legal</p>
              <p className="font-semibold text-foreground text-xs">{bestOption.rule}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de todas as opções */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Todas as Modalidades</h3>
        
        {results.map((result, index) => (
          <Card key={index} className="p-6 border-input-border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{result.type}</h4>
                  {result.canRetireNow ? (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Elegível
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pendente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                <p className="text-xs text-muted-foreground">{result.rule}</p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">
                  {result.estimatedValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
                <p className="text-xs text-muted-foreground">Valor estimado</p>
              </div>
            </div>

            {/* Progresso */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Progresso geral</span>
                <span className="text-sm font-medium">{Math.round(calculateProgress(result))}%</span>
              </div>
              <Progress value={calculateProgress(result)} className="h-2" />
            </div>

            {/* Detalhes dos requisitos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Idade</p>
                  <p className="font-medium">
                    {result.currentAge}/{result.requiredAge} anos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Contribuição</p>
                  <p className="font-medium">
                    {result.currentContribution}/{result.requiredContribution} anos
                  </p>
                </div>
              </div>

              {result.minimumPoints && result.currentPoints && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Pontos</p>
                    <p className="font-medium">
                      {result.currentPoints}/{result.minimumPoints}
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-muted-foreground">Tempo restante</p>
                <p className="font-medium text-foreground">
                  {formatTimeRemaining(result.yearsUntilRetirement, result.monthsUntilRetirement)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Informações importantes */}
      <Card className="p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Importante
            </h4>
            <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Os valores são estimativas baseadas na legislação atual</li>
              <li>• O cálculo real pode variar conforme histórico contributivo completo</li>
              <li>• Recomenda-se consultar o CNIS (Cadastro Nacional de Informações Sociais)</li>
              <li>• Valores sujeitos a alterações conforme revisões da previdência</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};