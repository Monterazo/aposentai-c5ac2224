export interface Client {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  endereco?: string;
  rg?: string;
  data_nascimento: string;
  entidade_id: string;
  created_at: string;
  updated_at: string;
  // Campos calculados
  documentsCount?: number;
  progress?: number;
  status?: "pending" | "analysis" | "completed" | "new";
  priority?: "high" | "medium" | "low";
  lastUpdate?: string;
  simulationsCount?: number;
  reportsCount?: number;
}