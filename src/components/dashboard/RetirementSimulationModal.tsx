import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Calculator, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const simulationSchema = z.object({
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.enum(["masculino", "feminino"], {
    required_error: "Selecione o sexo",
  }),
  contributionStartDate: z.string().min(1, "Data de início das contribuições é obrigatória"),
  currentSalary: z.string().min(1, "Salário atual é obrigatório"),
  isRural: z.boolean().default(false),
  hasSpecialWork: z.boolean().default(false),
  specialWorkYears: z.string().optional(),
  hasTeachingWork: z.boolean().default(false),
  teachingWorkYears: z.string().optional(),
});

type SimulationFormData = z.infer<typeof simulationSchema>;

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

interface RetirementSimulationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSimulationComplete: (results: RetirementResult[]) => void;
}

export const RetirementSimulationModal = ({
  open,
  onOpenChange,
  onSimulationComplete,
}: RetirementSimulationModalProps) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [contributionPercentage, setContributionPercentage] = useState([20]);

  const form = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      birthDate: "",
      gender: "masculino",
      contributionStartDate: "",
      currentSalary: "",
      isRural: false,
      hasSpecialWork: false,
      specialWorkYears: "",
      hasTeachingWork: false,
      teachingWorkYears: "",
    },
  });

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateContributionTime = (startDate: string): number => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25));
    return diffYears;
  };

  const calculateRetirementBenefit = (salary: number, contributionYears: number): number => {
    const minWage = 1412; // Salário mínimo 2024
    const maxWage = 7507.49; // Teto INSS 2024

    // Média salarial (simplificada)
    const averageSalary = Math.min(salary, maxWage);
    
    // Coeficiente baseado no tempo de contribuição
    let coefficient = 0.6; // Mínimo 60%
    
    if (contributionYears > 15) {
      coefficient += (contributionYears - 15) * 0.02; // +2% por ano acima de 15
    }
    
    coefficient = Math.min(coefficient, 1.0); // Máximo 100%
    
    const benefit = averageSalary * coefficient;
    return Math.max(benefit, minWage); // Nunca menor que o salário mínimo
  };

  const simulateRetirement = (data: SimulationFormData): RetirementResult[] => {
    const currentAge = calculateAge(data.birthDate);
    const contributionYears = calculateContributionTime(data.contributionStartDate);
    const salary = parseFloat(data.currentSalary.replace(/[^\d,]/g, '').replace(',', '.'));
    const isWoman = data.gender === "feminino";

    const results: RetirementResult[] = [];

    // 1. Aposentadoria por Idade (Nova Regra)
    const ageRetirementAge = isWoman ? 62 : 65;
    const ageRetirementContribution = 15;
    
    results.push({
      type: "Aposentadoria por Idade",
      description: `${ageRetirementAge} anos de idade + ${ageRetirementContribution} anos de contribuição`,
      requiredAge: ageRetirementAge,
      requiredContribution: ageRetirementContribution,
      currentAge,
      currentContribution: contributionYears,
      yearsUntilRetirement: Math.max(0, ageRetirementAge - currentAge),
      monthsUntilRetirement: Math.max(0, (ageRetirementAge - currentAge) * 12),
      estimatedValue: calculateRetirementBenefit(salary, Math.max(contributionYears, ageRetirementContribution)),
      canRetireNow: currentAge >= ageRetirementAge && contributionYears >= ageRetirementContribution,
      rule: "Nova Previdência (EC 103/2019)"
    });

    // 2. Regra de Transição - Sistema de Pontos
    const minPointsWoman = 87; // Em 2024
    const minPointsMan = 97; // Em 2024
    const minPoints = isWoman ? minPointsWoman : minPointsMan;
    const currentPoints = currentAge + contributionYears;
    const minAgeTransition = isWoman ? 57 : 62;
    const minContributionTransition = isWoman ? 30 : 35;

    results.push({
      type: "Regra de Transição - Pontos",
      description: `${minPoints} pontos (idade + tempo de contribuição) + ${minContributionTransition} anos mínimos`,
      requiredAge: minAgeTransition,
      requiredContribution: minContributionTransition,
      currentAge,
      currentContribution: contributionYears,
      yearsUntilRetirement: Math.max(
        0,
        Math.max(minPoints - currentPoints, minAgeTransition - currentAge, minContributionTransition - contributionYears)
      ),
      monthsUntilRetirement: Math.max(
        0,
        Math.max(minPoints - currentPoints, minAgeTransition - currentAge, minContributionTransition - contributionYears) * 12
      ),
      estimatedValue: calculateRetirementBenefit(salary, Math.max(contributionYears, minContributionTransition)),
      canRetireNow: currentPoints >= minPoints && currentAge >= minAgeTransition && contributionYears >= minContributionTransition,
      rule: "Regra de Transição (EC 103/2019)",
      minimumPoints: minPoints,
      currentPoints
    });

    // 3. Aposentadoria Especial (se aplicável)
    if (data.hasSpecialWork && data.specialWorkYears) {
      const specialYears = parseInt(data.specialWorkYears);
      const specialMinAge = 60;
      const specialMinContribution = 25;

      results.push({
        type: "Aposentadoria Especial",
        description: `${specialMinAge} anos + ${specialMinContribution} anos de atividade especial`,
        requiredAge: specialMinAge,
        requiredContribution: specialMinContribution,
        currentAge,
        currentContribution: specialYears,
        yearsUntilRetirement: Math.max(0, Math.max(specialMinAge - currentAge, specialMinContribution - specialYears)),
        monthsUntilRetirement: Math.max(0, Math.max(specialMinAge - currentAge, specialMinContribution - specialYears) * 12),
        estimatedValue: calculateRetirementBenefit(salary, Math.max(specialYears, specialMinContribution)) * 1.2, // Adicional especial
        canRetireNow: currentAge >= specialMinAge && specialYears >= specialMinContribution,
        rule: "Nova Previdência (EC 103/2019)"
      });
    }

    // 4. Aposentadoria do Professor (se aplicável)
    if (data.hasTeachingWork && data.teachingWorkYears) {
      const teachingYears = parseInt(data.teachingWorkYears);
      const teachingMinAge = isWoman ? 57 : 60;
      const teachingMinContribution = 25;

      results.push({
        type: "Aposentadoria do Professor",
        description: `${teachingMinAge} anos + ${teachingMinContribution} anos de magistério`,
        requiredAge: teachingMinAge,
        requiredContribution: teachingMinContribution,
        currentAge,
        currentContribution: teachingYears,
        yearsUntilRetirement: Math.max(0, Math.max(teachingMinAge - currentAge, teachingMinContribution - teachingYears)),
        monthsUntilRetirement: Math.max(0, Math.max(teachingMinAge - currentAge, teachingMinContribution - teachingYears) * 12),
        estimatedValue: calculateRetirementBenefit(salary, Math.max(teachingYears, teachingMinContribution)),
        canRetireNow: currentAge >= teachingMinAge && teachingYears >= teachingMinContribution,
        rule: "Nova Previdência (EC 103/2019)"
      });
    }

    // 5. Aposentadoria Rural (se aplicável)
    if (data.isRural) {
      const ruralMinAge = isWoman ? 55 : 60;
      const ruralMinContribution = 15;

      results.push({
        type: "Aposentadoria Rural",
        description: `${ruralMinAge} anos + ${ruralMinContribution} anos de atividade rural`,
        requiredAge: ruralMinAge,
        requiredContribution: ruralMinContribution,
        currentAge,
        currentContribution: contributionYears,
        yearsUntilRetirement: Math.max(0, Math.max(ruralMinAge - currentAge, ruralMinContribution - contributionYears)),
        monthsUntilRetirement: Math.max(0, Math.max(ruralMinAge - currentAge, ruralMinContribution - contributionYears) * 12),
        estimatedValue: 1412, // Salário mínimo para aposentadoria rural
        canRetireNow: currentAge >= ruralMinAge && contributionYears >= ruralMinContribution,
        rule: "Lei 8.213/1991 (Rural)"
      });
    }

    return results.sort((a, b) => a.yearsUntilRetirement - b.yearsUntilRetirement);
  };

  const onSubmit = async (data: SimulationFormData) => {
    setIsCalculating(true);
    
    // Simular cálculo (delay artificial para melhor UX)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = simulateRetirement(data);
    onSimulationComplete(results);
    setIsCalculating(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Simulação de Aposentadoria
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para calcular suas opções de aposentadoria baseadas na 
            reforma da previdência (EC 103/2019)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Dados Pessoais</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Dados Previdenciários */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Dados Previdenciários</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contributionStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início das Contribuições</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSalary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salário Atual (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 5.000,00" 
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              const formatted = new Intl.NumberFormat('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }).format(parseInt(value) / 100);
                              field.onChange(formatted);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label>Percentual de Contribuição: {contributionPercentage[0]}%</Label>
                    <Slider
                      value={contributionPercentage}
                      onValueChange={setContributionPercentage}
                      max={20}
                      min={8}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      8% a 20% sobre o salário de contribuição
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Situações Especiais */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Situações Especiais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRural"
                      checked={form.watch("isRural")}
                      onChange={(e) => form.setValue("isRural", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="isRural">Trabalho Rural</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasSpecialWork"
                      checked={form.watch("hasSpecialWork")}
                      onChange={(e) => form.setValue("hasSpecialWork", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="hasSpecialWork">Atividade Especial</Label>
                  </div>
                  
                  {form.watch("hasSpecialWork") && (
                    <FormField
                      control={form.control}
                      name="specialWorkYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Atividade Especial</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 15" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasTeachingWork"
                      checked={form.watch("hasTeachingWork")}
                      onChange={(e) => form.setValue("hasTeachingWork", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="hasTeachingWork">Professor</Label>
                  </div>
                  
                  {form.watch("hasTeachingWork") && (
                    <FormField
                      control={form.control}
                      name="teachingWorkYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Magistério</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Ex: 20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isCalculating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Simulação
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};