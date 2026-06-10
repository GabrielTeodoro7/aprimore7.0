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
          anonimizado: boolean
          cpf: string | null
          created_at: string
          data_desligamento: string | null
          deletado_em: string | null
          email: string | null
          escola_id: string | null
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
          anonimizado?: boolean
          cpf?: string | null
          created_at?: string
          data_desligamento?: string | null
          deletado_em?: string | null
          email?: string | null
          escola_id?: string | null
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
          anonimizado?: boolean
          cpf?: string | null
          created_at?: string
          data_desligamento?: string | null
          deletado_em?: string | null
          email?: string | null
          escola_id?: string | null
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
            foreignKeyName: "alunos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
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
      anomalias_acesso: {
        Row: {
          cidade: string | null
          created_at: string
          detalhes: Json
          gravidade: string
          id: string
          ip: string | null
          notificado: boolean
          pais: string | null
          reconhecido: boolean
          reconhecido_em: string | null
          tipo: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          detalhes?: Json
          gravidade?: string
          id?: string
          ip?: string | null
          notificado?: boolean
          pais?: string | null
          reconhecido?: boolean
          reconhecido_em?: string | null
          tipo: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          detalhes?: Json
          gravidade?: string
          id?: string
          ip?: string | null
          notificado?: boolean
          pais?: string | null
          reconhecido?: boolean
          reconhecido_em?: string | null
          tipo?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
            foreignKeyName: "atividade_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
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
          deletado_em: string | null
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
          deletado_em?: string | null
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
          deletado_em?: string | null
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
          deletado_em: string | null
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
          deletado_em?: string | null
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
          deletado_em?: string | null
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
      bi_consolidado_turma: {
        Row: {
          created_at: string
          id: string
          media_geral: number | null
          percentual_aprovacao: number | null
          referencia_mes_ano: string
          total_alunos: number | null
          turma_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_geral?: number | null
          percentual_aprovacao?: number | null
          referencia_mes_ano: string
          total_alunos?: number | null
          turma_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_geral?: number | null
          percentual_aprovacao?: number | null
          referencia_mes_ano?: string
          total_alunos?: number | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bi_consolidado_turma_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_logs_exportacao: {
        Row: {
          created_at: string
          filtros_aplicados: Json | null
          formato_exportacao: string
          id: string
          registros_afetados: number | null
          tipo_dados: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filtros_aplicados?: Json | null
          formato_exportacao: string
          id?: string
          registros_afetados?: number | null
          tipo_dados: string
          user_id: string
        }
        Update: {
          created_at?: string
          filtros_aplicados?: Json | null
          formato_exportacao?: string
          id?: string
          registros_afetados?: number | null
          tipo_dados?: string
          user_id?: string
        }
        Relationships: []
      }
      bloqueios_conta: {
        Row: {
          created_at: string
          email: string
          expira_em: string
          id: string
          iniciou_em: string
          liberado: boolean
          liberado_em: string | null
          motivo: string
          tentativas: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expira_em: string
          id?: string
          iniciou_em?: string
          liberado?: boolean
          liberado_em?: string | null
          motivo?: string
          tentativas?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expira_em?: string
          id?: string
          iniciou_em?: string
          liberado?: boolean
          liberado_em?: string | null
          motivo?: string
          tentativas?: number
          user_id?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "conquistas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
            referencedColumns: ["id"]
          },
        ]
      }
      conquistas_aluno: {
        Row: {
          aluno_id: string | null
          data_conquista: string | null
          id: string
          selo_id: string | null
        }
        Insert: {
          aluno_id?: string | null
          data_conquista?: string | null
          id?: string
          selo_id?: string | null
        }
        Update: {
          aluno_id?: string | null
          data_conquista?: string | null
          id?: string
          selo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conquistas_aluno_selo_id_fkey"
            columns: ["selo_id"]
            isOneToOne: false
            referencedRelation: "selos"
            referencedColumns: ["id"]
          },
        ]
      }
      consentimentos: {
        Row: {
          concedido: boolean
          concedido_em: string | null
          created_at: string
          finalidade: Database["public"]["Enums"]["finalidade_consentimento"]
          id: string
          ip: string | null
          profile_id: string
          revogado_em: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          concedido: boolean
          concedido_em?: string | null
          created_at?: string
          finalidade: Database["public"]["Enums"]["finalidade_consentimento"]
          id?: string
          ip?: string | null
          profile_id: string
          revogado_em?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          concedido?: boolean
          concedido_em?: string | null
          created_at?: string
          finalidade?: Database["public"]["Enums"]["finalidade_consentimento"]
          id?: string
          ip?: string | null
          profile_id?: string
          revogado_em?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      denuncias_mensagem: {
        Row: {
          data_denuncia: string | null
          data_resolucao: string | null
          denunciante_id: string | null
          detalhes: string | null
          id: string
          mensagem_id: string
          moderador_id: string | null
          motivo: string
          status: string | null
        }
        Insert: {
          data_denuncia?: string | null
          data_resolucao?: string | null
          denunciante_id?: string | null
          detalhes?: string | null
          id?: string
          mensagem_id: string
          moderador_id?: string | null
          motivo: string
          status?: string | null
        }
        Update: {
          data_denuncia?: string | null
          data_resolucao?: string | null
          denunciante_id?: string | null
          detalhes?: string | null
          id?: string
          mensagem_id?: string
          moderador_id?: string | null
          motivo?: string
          status?: string | null
        }
        Relationships: []
      }
      documentos_aluno: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
          observacao: string | null
          status: string
          tipo_documento: string
          url_arquivo: string
          validado_em: string | null
          validado_por: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string
          id?: string
          observacao?: string | null
          status?: string
          tipo_documento: string
          url_arquivo: string
          validado_em?: string | null
          validado_por?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
          observacao?: string | null
          status?: string
          tipo_documento?: string
          url_arquivo?: string
          validado_em?: string | null
          validado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentos_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_aluno_validado_por_fkey"
            columns: ["validado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos_legais: {
        Row: {
          created_at: string
          id: string
          obrigatorio: boolean
          texto: string
          tipo: Database["public"]["Enums"]["tipo_documento_legal"]
          versao: string
          vigente_em: string
        }
        Insert: {
          created_at?: string
          id?: string
          obrigatorio?: boolean
          texto: string
          tipo: Database["public"]["Enums"]["tipo_documento_legal"]
          versao: string
          vigente_em?: string
        }
        Update: {
          created_at?: string
          id?: string
          obrigatorio?: boolean
          texto?: string
          tipo?: Database["public"]["Enums"]["tipo_documento_legal"]
          versao?: string
          vigente_em?: string
        }
        Relationships: []
      }
      dominios_institucionais: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          dominio: string
          id: string
          obrigatorio: boolean
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          dominio: string
          id?: string
          obrigatorio?: boolean
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          dominio?: string
          id?: string
          obrigatorio?: boolean
        }
        Relationships: []
      }
      escolas: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          config_json: Json | null
          created_at: string | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          config_json?: Json | null
          created_at?: string | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          config_json?: Json | null
          created_at?: string | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      feriados: {
        Row: {
          data: string
          id: string
          nome: string
          tipo: string | null
        }
        Insert: {
          data: string
          id?: string
          nome: string
          tipo?: string | null
        }
        Update: {
          data?: string
          id?: string
          nome?: string
          tipo?: string | null
        }
        Relationships: []
      }
      financeiro_config: {
        Row: {
          dia_vencimento_padrao: number
          escola_id: string
          id: string
          juros_mes_percentual: number | null
          multa_atraso_percentual: number | null
        }
        Insert: {
          dia_vencimento_padrao?: number
          escola_id: string
          id?: string
          juros_mes_percentual?: number | null
          multa_atraso_percentual?: number | null
        }
        Update: {
          dia_vencimento_padrao?: number
          escola_id?: string
          id?: string
          juros_mes_percentual?: number | null
          multa_atraso_percentual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_config_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: true
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro_mensalidades: {
        Row: {
          aluno_id: string
          created_at: string
          data_pagamento: string | null
          data_vencimento: string
          forma_pagamento: string | null
          id: string
          link_pagamento: string | null
          status: string
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento: string
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          status?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data_pagamento?: string | null
          data_vencimento?: string
          forma_pagamento?: string | null
          id?: string
          link_pagamento?: string | null
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_mensalidades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_mensalidades_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
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
            foreignKeyName: "frequencia_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
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
      ia_analise_aluno: {
        Row: {
          aluno_id: string | null
          id: string
          last_analise_at: string
          plano_acao_sugerido: string | null
          pontos_fortes: string[] | null
          pontos_melhoria: string[] | null
          risco_evasao: number | null
        }
        Insert: {
          aluno_id?: string | null
          id?: string
          last_analise_at?: string
          plano_acao_sugerido?: string | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          risco_evasao?: number | null
        }
        Update: {
          aluno_id?: string | null
          id?: string
          last_analise_at?: string
          plano_acao_sugerido?: string | null
          pontos_fortes?: string[] | null
          pontos_melhoria?: string[] | null
          risco_evasao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_analise_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ia_analise_aluno_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_sugestoes: {
        Row: {
          conteudo_original: string | null
          created_at: string
          feedback_usuario: string | null
          id: string
          professor_id: string | null
          sugestao_ia: string
          tipo_sugestao: string
          turma_id: string | null
        }
        Insert: {
          conteudo_original?: string | null
          created_at?: string
          feedback_usuario?: string | null
          id?: string
          professor_id?: string | null
          sugestao_ia: string
          tipo_sugestao: string
          turma_id?: string | null
        }
        Update: {
          conteudo_original?: string | null
          created_at?: string
          feedback_usuario?: string | null
          id?: string
          professor_id?: string | null
          sugestao_ia?: string
          tipo_sugestao?: string
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_sugestoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ia_sugestoes_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_exportacoes: {
        Row: {
          created_at: string
          erro: string | null
          expira_em: string | null
          id: string
          profile_id: string
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          erro?: string | null
          expira_em?: string | null
          id?: string
          profile_id: string
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          erro?: string | null
          expira_em?: string | null
          id?: string
          profile_id?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      limites_plano: {
        Row: {
          id: string
          limite_max: number
          recurso: string
          uso_atual: number | null
        }
        Insert: {
          id?: string
          limite_max: number
          recurso: string
          uso_atual?: number | null
        }
        Update: {
          id?: string
          limite_max?: number
          recurso?: string
          uso_atual?: number | null
        }
        Relationships: []
      }
      logs_acesso_sensiveis: {
        Row: {
          actor_id: string | null
          aluno_id: string | null
          campo: string
          contexto_normal: boolean
          created_at: string
          id: string
          justificativa: string | null
        }
        Insert: {
          actor_id?: string | null
          aluno_id?: string | null
          campo: string
          contexto_normal?: boolean
          created_at?: string
          id?: string
          justificativa?: string | null
        }
        Update: {
          actor_id?: string | null
          aluno_id?: string | null
          campo?: string
          contexto_normal?: boolean
          created_at?: string
          id?: string
          justificativa?: string | null
        }
        Relationships: []
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
      politica_senha: {
        Row: {
          ativo: boolean
          created_at: string
          escopo: string
          exige_maiuscula: boolean
          exige_minuscula: boolean
          exige_numero: boolean
          exige_simbolo: boolean
          expiracao_dias: number
          historico_n: number
          id: string
          janela_lock_min: number
          max_tentativas: number
          min_tamanho: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          escopo?: string
          exige_maiuscula?: boolean
          exige_minuscula?: boolean
          exige_numero?: boolean
          exige_simbolo?: boolean
          expiracao_dias?: number
          historico_n?: number
          id?: string
          janela_lock_min?: number
          max_tentativas?: number
          min_tamanho?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          escopo?: string
          exige_maiuscula?: boolean
          exige_minuscula?: boolean
          exige_numero?: boolean
          exige_simbolo?: boolean
          expiracao_dias?: number
          historico_n?: number
          id?: string
          janela_lock_min?: number
          max_tentativas?: number
          min_tamanho?: number
          updated_at?: string
        }
        Relationships: []
      }
      pranchas_comunicacao: {
        Row: {
          created_at: string | null
          favorita: boolean | null
          id: string
          layout_json: Json
          titulo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          favorita?: boolean | null
          id?: string
          layout_json?: Json
          titulo: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          favorita?: boolean | null
          id?: string
          layout_json?: Json
          titulo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      preferencias_acessibilidade: {
        Row: {
          alto_contraste: boolean | null
          atalhos_teclado: boolean | null
          daltonismo_tipo: string | null
          fonte_ampliada: boolean | null
          leitura_tela: boolean | null
          ultima_sincronizacao: string | null
          user_id: string
        }
        Insert: {
          alto_contraste?: boolean | null
          atalhos_teclado?: boolean | null
          daltonismo_tipo?: string | null
          fonte_ampliada?: boolean | null
          leitura_tela?: boolean | null
          ultima_sincronizacao?: string | null
          user_id: string
        }
        Update: {
          alto_contraste?: boolean | null
          atalhos_teclado?: boolean | null
          daltonismo_tipo?: string | null
          fonte_ampliada?: boolean | null
          leitura_tela?: boolean | null
          ultima_sincronizacao?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ano: string | null
          bloqueado_ate: string | null
          cargo: string | null
          created_at: string
          deletado_em: string | null
          email: string
          escola: string | null
          escola_id: string | null
          exige_troca: boolean
          id: string
          is_demo: boolean
          nome: string
          professor_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          senha_alterada_em: string | null
          status: string
          theme: string
          turma: string | null
          ultimo_acesso: string | null
          ultimo_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: string | null
          bloqueado_ate?: string | null
          cargo?: string | null
          created_at?: string
          deletado_em?: string | null
          email: string
          escola?: string | null
          escola_id?: string | null
          exige_troca?: boolean
          id?: string
          is_demo?: boolean
          nome?: string
          professor_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          senha_alterada_em?: string | null
          status?: string
          theme?: string
          turma?: string | null
          ultimo_acesso?: string | null
          ultimo_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: string | null
          bloqueado_ate?: string | null
          cargo?: string | null
          created_at?: string
          deletado_em?: string | null
          email?: string
          escola?: string | null
          escola_id?: string | null
          exige_troca?: boolean
          id?: string
          is_demo?: boolean
          nome?: string
          professor_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          senha_alterada_em?: string | null
          status?: string
          theme?: string
          turma?: string | null
          ultimo_acesso?: string | null
          ultimo_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          emitido_em: string
          expira_em: string
          id: string
          ip: string | null
          revogado: boolean
          rotacionado: boolean
          rotacionado_em: string | null
          sucessor_id: string | null
          token_hash: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          emitido_em?: string
          expira_em: string
          id?: string
          ip?: string | null
          revogado?: boolean
          rotacionado?: boolean
          rotacionado_em?: string | null
          sucessor_id?: string | null
          token_hash: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          emitido_em?: string
          expira_em?: string
          id?: string
          ip?: string | null
          revogado?: boolean
          rotacionado?: boolean
          rotacionado_em?: string | null
          sucessor_id?: string | null
          token_hash?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_sucessor_id_fkey"
            columns: ["sucessor_id"]
            isOneToOne: false
            referencedRelation: "refresh_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      ripd_relatorios: {
        Row: {
          ano: number
          gerado_em: string
          id: string
          resumo: Json | null
          storage_path: string | null
          trimestre: number
        }
        Insert: {
          ano: number
          gerado_em?: string
          id?: string
          resumo?: Json | null
          storage_path?: string | null
          trimestre: number
        }
        Update: {
          ano?: number
          gerado_em?: string
          id?: string
          resumo?: Json | null
          storage_path?: string | null
          trimestre?: number
        }
        Relationships: []
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
          {
            foreignKeyName: "rotina_itens_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
            referencedColumns: ["id"]
          },
        ]
      }
      selos: {
        Row: {
          categoria: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      senha_historico: {
        Row: {
          algoritmo: string
          created_at: string
          hash: string
          id: string
          iteracoes: number
          user_id: string
        }
        Insert: {
          algoritmo?: string
          created_at?: string
          hash: string
          id?: string
          iteracoes?: number
          user_id: string
        }
        Update: {
          algoritmo?: string
          created_at?: string
          hash?: string
          id?: string
          iteracoes?: number
          user_id?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "sentimentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
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
            foreignKeyName: "submissoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "v_alunos_ativos"
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
      sync_queue: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          operation: string
          payload: Json
          retry_count: number
          status: string
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          operation: string
          payload?: Json
          retry_count?: number
          status?: string
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          operation?: string
          payload?: Json
          retry_count?: number
          status?: string
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      tentativas_login: {
        Row: {
          created_at: string
          email: string
          id: string
          ip: string | null
          motivo: string | null
          sucesso: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip?: string | null
          motivo?: string | null
          sucesso: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip?: string | null
          motivo?: string | null
          sucesso?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      termos_aceitos: {
        Row: {
          aceito_em: string
          documento_id: string
          id: string
          ip: string | null
          profile_id: string
          user_agent: string | null
        }
        Insert: {
          aceito_em?: string
          documento_id: string
          id?: string
          ip?: string | null
          profile_id: string
          user_agent?: string | null
        }
        Update: {
          aceito_em?: string
          documento_id?: string
          id?: string
          ip?: string | null
          profile_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_aceitos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos_legais"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens_recuperacao_senha: {
        Row: {
          criado_em: string
          email_alvo: string
          expira_em: string
          id: string
          ip_origem: string | null
          token_hash: string
          usado: boolean
          usado_em: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          email_alvo: string
          expira_em: string
          id?: string
          ip_origem?: string | null
          token_hash: string
          usado?: boolean
          usado_em?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          email_alvo?: string
          expira_em?: string
          id?: string
          ip_origem?: string | null
          token_hash?: string
          usado?: boolean
          usado_em?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      turmas: {
        Row: {
          ano: string | null
          capacidade: number
          created_at: string
          deletado_em: string | null
          escola_id: string | null
          id: string
          nome: string
          professor_id: string
          updated_at: string
        }
        Insert: {
          ano?: string | null
          capacidade?: number
          created_at?: string
          deletado_em?: string | null
          escola_id?: string | null
          id?: string
          nome: string
          professor_id: string
          updated_at?: string
        }
        Update: {
          ano?: string | null
          capacidade?: number
          created_at?: string
          deletado_em?: string | null
          escola_id?: string | null
          id?: string
          nome?: string
          professor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
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
      v_alunos_ativos: {
        Row: {
          anonimizado: boolean | null
          cpf: string | null
          created_at: string | null
          data_desligamento: string | null
          deletado_em: string | null
          email: string | null
          estrelas: number | null
          freq: string | null
          id: string | null
          idade: number | null
          media: number | null
          necessidade: string | null
          nome: string | null
          observacoes: string | null
          profile_id: string | null
          responsavel: string | null
          tag: string | null
          telefone: string | null
          tone: string | null
          turma_id: string | null
          updated_at: string | null
        }
        Insert: {
          anonimizado?: boolean | null
          cpf?: string | null
          created_at?: string | null
          data_desligamento?: string | null
          deletado_em?: string | null
          email?: string | null
          estrelas?: number | null
          freq?: string | null
          id?: string | null
          idade?: number | null
          media?: number | null
          necessidade?: string | null
          nome?: string | null
          observacoes?: string | null
          profile_id?: string | null
          responsavel?: string | null
          tag?: string | null
          telefone?: string | null
          tone?: string | null
          turma_id?: string | null
          updated_at?: string | null
        }
        Update: {
          anonimizado?: boolean | null
          cpf?: string | null
          created_at?: string | null
          data_desligamento?: string | null
          deletado_em?: string | null
          email?: string | null
          estrelas?: number | null
          freq?: string | null
          id?: string | null
          idade?: number | null
          media?: number | null
          necessidade?: string | null
          nome?: string | null
          observacoes?: string | null
          profile_id?: string | null
          responsavel?: string | null
          tag?: string | null
          telefone?: string | null
          tone?: string | null
          turma_id?: string | null
          updated_at?: string | null
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
      v_bi_comparativo_escolas: {
        Row: {
          escola_nome: string | null
          media_escola: number | null
          total_alunos: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_profile_id: { Args: never; Returns: string }
      dominio_email_permitido: { Args: { _email: string }; Returns: boolean }
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
      senha_precisa_trocar: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "ceo" | "admin" | "professor" | "aluno"
      finalidade_consentimento:
        | "CADASTRO"
        | "IMAGEM"
        | "COMUNICACOES"
        | "COMPARTILHAMENTO"
      tipo_documento_legal: "TERMOS_USO" | "POLITICA_PRIVACIDADE"
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
      finalidade_consentimento: [
        "CADASTRO",
        "IMAGEM",
        "COMUNICACOES",
        "COMPARTILHAMENTO",
      ],
      tipo_documento_legal: ["TERMOS_USO", "POLITICA_PRIVACIDADE"],
    },
  },
} as const
