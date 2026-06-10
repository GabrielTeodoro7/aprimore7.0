export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          cpf: string | null
          created_at: string
          email: string | null
          estrelas: number
          freq: string | null
          id: string
          idade: number | null
          media: number | null
          necessidade: string | null
          nome: string
          observacoes: string | null
          profile_id: string | null
          responsavel: string | null
          tag: string
          telefone: string | null
          tone: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          estrelas?: number
          freq?: string | null
          id?: string
          idade?: number | null
          media?: number | null
          necessidade?: string | null
          nome: string
          observacoes?: string | null
          profile_id?: string | null
          responsavel?: string | null
          tag?: string
          telefone?: string | null
          tone?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          cpf?: string | null
          created_at?: string
          email?: string | null
          estrelas?: number
          freq?: string | null
          id?: string
          idade?: number | null
          media?: number | null
          necessidade?: string | null
          nome?: string
          observacoes?: string | null
          profile_id?: string | null
          responsavel?: string | null
          tag?: string
          telefone?: string | null
          tone?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      atividade_alunos: {
        Row: {
          aluno_id: string
          atividade_id: string
          id: string
        }
        Insert: {
          aluno_id: string
          atividade_id: string
          id?: string
        }
        Update: {
          aluno_id?: string
          atividade_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividade_alunos_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          adaptada: boolean
          created_at: string
          data: string | null
          descricao: string | null
          dificuldade: string | null
          id: string
          materia: string
          materiais: string[]
          objetivos: string[]
          passos: string[]
          professor_id: string
          titulo: string
          tone: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          adaptada?: boolean
          created_at?: string
          data?: string | null
          descricao?: string | null
          dificuldade?: string | null
          id?: string
          materia?: string
          materiais?: string[]
          objetivos?: string[]
          passos?: string[]
          professor_id: string
          titulo: string
          tone?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          adaptada?: boolean
          created_at?: string
          data?: string | null
          descricao?: string | null
          dificuldade?: string | null
          id?: string
          materia?: string
          materiais?: string[]
          objetivos?: string[]
          passos?: string[]
          professor_id?: string
          titulo?: string
          tone?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          acao: string
          actor_id: string | null
          created_at: string
          entidade: string
          entidade_id: string | null
          id: string
          payload: Json | null
        }
        Insert: {
          acao: string
          actor_id?: string | null
          created_at?: string
          entidade: string
          entidade_id?: string | null
          id?: string
          payload?: Json | null
        }
        Update: {
          acao?: string
          actor_id?: string | null
          created_at?: string
          entidade?: string
          entidade_id?: string | null
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          alunos: number
          created_at: string
          data: string | null
          id: string
          materia: string
          media: number | null
          observacoes: string | null
          peso: number
          professor_id: string
          titulo: string
          tone: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          alunos?: number
          created_at?: string
          data?: string | null
          id?: string
          materia?: string
          media?: number | null
          observacoes?: string | null
          peso?: number
          professor_id: string
          titulo: string
          tone?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          alunos?: number
          created_at?: string
          data?: string | null
          id?: string
          materia?: string
          media?: number | null
          observacoes?: string | null
          peso?: number
          professor_id?: string
          titulo?: string
          tone?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicados: {
        Row: {
          corpo: string
          created_at: string
          id: string
          professor_id: string
          titulo: string
          turma_id: string
        }
        Insert: {
          corpo: string
          created_at?: string
          id?: string
          professor_id: string
          titulo: string
          turma_id: string
        }
        Update: {
          corpo?: string
          created_at?: string
          id?: string
          professor_id?: string
          titulo?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicados_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicados_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      conquistas: {
        Row: {
          aluno_id: string
          created_at: string
          descricao: string | null
          emoji: string | null
          id: string
          tipo: string
          titulo: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          descricao?: string | null
          emoji?: string | null
          id?: string
          tipo: string
          titulo: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          descricao?: string | null
          emoji?: string | null
          id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      frequencia: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          justificativa: string | null
          presente: boolean
          turma_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          justificativa?: string | null
          presente?: boolean
          turma_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          justificativa?: string | null
          presente?: boolean
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequencia_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          created_at: string
          destinatario_id: string | null
          id: string
          lida: boolean
          remetente_id: string
          texto: string
          turma_id: string | null
        }
        Insert: {
          created_at?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          remetente_id: string
          texto: string
          turma_id?: string | null
        }
        Update: {
          created_at?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          remetente_id?: string
          texto?: string
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          read: boolean
          sub: string
          title: string
          tone: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          read?: boolean
          sub?: string
          title: string
          tone?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          read?: boolean
          sub?: string
          title?: string
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ano: string | null
          cargo: string | null
          created_at: string
          email: string
          escola: string | null
          id: string
          is_demo: boolean
          nome: string
          professor_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          theme: string
          turma: string | null
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          escola?: string | null
          id?: string
          is_demo?: boolean
          nome?: string
          professor_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          theme?: string
          turma?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          escola?: string | null
          id?: string
          is_demo?: boolean
          nome?: string
          professor_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          theme?: string
          turma?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rotina_itens: {
        Row: {
          aluno_id: string
          created_at: string
          descricao: string
          emoji: string
          hora: string
          id: string
          posicao: number
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          descricao?: string
          emoji?: string
          hora: string
          id?: string
          posicao?: number
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          descricao?: string
          emoji?: string
          hora?: string
          id?: string
          posicao?: number
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotina_itens_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      sentimentos: {
        Row: {
          aluno_id: string
          created_at: string
          emocao: string
          emoji: string | null
          id: string
          intensidade: number | null
          nota: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          emocao: string
          emoji?: string | null
          id?: string
          intensidade?: number | null
          nota?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          emocao?: string
          emoji?: string | null
          id?: string
          intensidade?: number | null
          nota?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sentimentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
        ]
      }
      submissoes: {
        Row: {
          aluno_id: string
          atividade_id: string
          created_at: string
          entregue_em: string | null
          feedback: string | null
          id: string
          nota: number | null
          status: string
          updated_at: string
        }
        Insert: {
          aluno_id: string
          atividade_id: string
          created_at?: string
          entregue_em?: string | null
          feedback?: string | null
          id?: string
          nota?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          atividade_id?: string
          created_at?: string
          entregue_em?: string | null
          feedback?: string | null
          id?: string
          nota?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissoes_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano: string | null
          capacidade: number
          created_at: string
          id: string
          nome: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          ano?: string | null
          capacidade?: number
          created_at?: string
          id?: string
          nome: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          ano?: string | null
          capacidade?: number
          created_at?: string
          id?: string
          nome?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_aluno_owner: { Args: { _aluno_id: string }; Returns: boolean }
      is_ceo: { Args: { _user_id: string }; Returns: boolean }
      is_demo_user: { Args: { _user_id: string }; Returns: boolean }
      is_professor_of_turma: { Args: { _turma_id: string }; Returns: boolean }
      is_valid_cpf: { Args: { _cpf: string }; Returns: boolean }
    }
    Enums: {
      app_role: "ceo" | "admin" | "professor" | "aluno"
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
      app_role: ["ceo", "admin", "professor", "aluno"],
    },
  },
} as const
