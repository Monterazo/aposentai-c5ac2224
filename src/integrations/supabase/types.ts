export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alertas: {
        Row: {
          cliente_id: string | null
          created_at: string
          documento_id: string | null
          id: string
          lido: boolean
          mensagem: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          documento_id?: string | null
          id?: string
          lido?: boolean
          mensagem: string
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          documento_id?: string | null
          id?: string
          lido?: boolean
          mensagem?: string
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alertas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analises: {
        Row: {
          analista_id: string
          cliente_id: string
          created_at: string
          id: string
          observacoes: string | null
          percentual_completude: number | null
          resultado_analise: string | null
          tipo_aposentadoria_id: string | null
          updated_at: string
        }
        Insert: {
          analista_id: string
          cliente_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          percentual_completude?: number | null
          resultado_analise?: string | null
          tipo_aposentadoria_id?: string | null
          updated_at?: string
        }
        Update: {
          analista_id?: string
          cliente_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          percentual_completude?: number | null
          resultado_analise?: string | null
          tipo_aposentadoria_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analises_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analises_tipo_aposentadoria_id_fkey"
            columns: ["tipo_aposentadoria_id"]
            isOneToOne: false
            referencedRelation: "tipos_aposentadoria"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          entidade_id: string
          id: string
          plano: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entidade_id: string
          id?: string
          plano: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          entidade_id?: string
          id?: string
          plano?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cpf: string
          created_at: string
          data_nascimento: string
          email: string | null
          endereco: string | null
          entidade_id: string | null
          id: string
          nome: string
          rg: string | null
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cpf: string
          created_at?: string
          data_nascimento: string
          email?: string | null
          endereco?: string | null
          entidade_id?: string | null
          id?: string
          nome: string
          rg?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cpf?: string
          created_at?: string
          data_nascimento?: string
          email?: string | null
          endereco?: string | null
          entidade_id?: string | null
          id?: string
          nome?: string
          rg?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_entidade_id_fkey"
            columns: ["entidade_id"]
            isOneToOne: false
            referencedRelation: "entidades"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          caminho_arquivo: string | null
          cliente_id: string
          created_at: string
          id: string
          nome_arquivo: string
          observacoes: string | null
          status_validacao: Database["public"]["Enums"]["validation_status"]
          tipo_documento: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          caminho_arquivo?: string | null
          cliente_id: string
          created_at?: string
          id?: string
          nome_arquivo: string
          observacoes?: string | null
          status_validacao?: Database["public"]["Enums"]["validation_status"]
          tipo_documento: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          caminho_arquivo?: string | null
          cliente_id?: string
          created_at?: string
          id?: string
          nome_arquivo?: string
          observacoes?: string | null
          status_validacao?: Database["public"]["Enums"]["validation_status"]
          tipo_documento?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entidades: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string
          endereco: string | null
          id: string
          nome_fantasia: string
          oab_numero: string | null
          owner_id: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["entity_type"]
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email: string
          endereco?: string | null
          id?: string
          nome_fantasia: string
          oab_numero?: string | null
          owner_id: string
          telefone?: string | null
          tipo: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string
          endereco?: string | null
          id?: string
          nome_fantasia?: string
          oab_numero?: string | null
          owner_id?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["entity_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entidades_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          gender: string | null
          id: string
          last_login: string | null
          oab_number: string | null
          oab_state: string | null
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          security_questions: Json | null
          subscription_status: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          gender?: string | null
          id: string
          last_login?: string | null
          oab_number?: string | null
          oab_state?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          security_questions?: Json | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          gender?: string | null
          id?: string
          last_login?: string | null
          oab_number?: string | null
          oab_state?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          security_questions?: Json | null
          subscription_status?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      requisitos_documentos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome_documento: string
          obrigatorio: boolean
          tipo_aposentadoria_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_documento: string
          obrigatorio?: boolean
          tipo_aposentadoria_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome_documento?: string
          obrigatorio?: boolean
          tipo_aposentadoria_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisitos_documentos_tipo_aposentadoria_id_fkey"
            columns: ["tipo_aposentadoria_id"]
            isOneToOne: false
            referencedRelation: "tipos_aposentadoria"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_aposentadoria: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          requisitos_gerais: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          requisitos_gerais?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          requisitos_gerais?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_cpf: {
        Args: { cpf_input: string }
        Returns: boolean
      }
      validate_phone: {
        Args: { phone_input: string }
        Returns: boolean
      }
    }
    Enums: {
      entity_type: "advogado_solo" | "escritorio"
      user_role: "admin" | "advogado" | "usuario_comum"
      validation_status: "pendente" | "aprovado" | "rejeitado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entity_type: ["advogado_solo", "escritorio"],
      user_role: ["admin", "advogado", "usuario_comum"],
      validation_status: ["pendente", "aprovado", "rejeitado"],
    },
  },
} as const
