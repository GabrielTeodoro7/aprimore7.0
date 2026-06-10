# Relatório de Catalogação de Casos de Uso (UC) - Versão Final Consolidada

Este documento lista todos os Casos de Uso (UC) identificados e catalogados a partir das 603 páginas de especificação do projeto, organizados por módulos funcionais.

## Módulo 1: Segurança e Identidade
- **UC.001:** Cadastro de Usuário com Whitelist de Domínio (RN.35).
- **UC.002:** Login com Autenticação Multifator (MFA) opcional e Bloqueio Progressivo (RN.02).
- **UC.003:** Gestão de Senhas com Histórico e Complexidade (RN.01, RN.62).
- **UC.004:** Recuperação de Senha com Proteção contra Enumeração (RN.07).
- **UC.005:** Monitoramento e Alerta de Anomalias de Acesso (RN.61).
- **UC.006:** Rotação e Auditoria de Refresh Tokens (RN.03).

## Módulo 2: Vida Acadêmica e Pedagógica
- **UC.007:** Matrícula de Alunos com Validação de CPF e Capacidade (RN.13).
- **UC.008:** Controle de Frequência Diária com Trava de Retroatividade (RN.14).
- **UC.009:** Gestão de Justificativas de Falta com Fluxo de Aprovação (RN.15).
- **UC.010:** Lançamento de Notas e Fechamento de Bimestres (RN.16, RN.17, RN.18).
- **UC.011:** Criação e Acompanhamento de PDI (Plano de Desenvolvimento Individual) (RN.19, RN.20, RN.21).
- **UC.012:** Alertas Automáticos de Metas de PDI Vencidas (RN.22).

## Módulo 3: Comunicação e Inclusão
- **UC.013:** Personalização de Pranchas de Comunicação Alternativa (RN.24).
- **UC.014:** Troca de Mensagens Privadas com Moderação de Conteúdo (RN.25).
- **UC.015:** Configuração de Acessibilidade Sincronizada Cross-Device (RN.37).
- **UC.016:** Notificações de Sistema com Retry Exponencial (RN.26).

## Módulo 4: Gestão Institucional e BI
- **UC.017:** Isolamento Multi-tenant por Unidade Escolar (RN.41, RN.42).
- **UC.018:** Dashboards de BI com Comparativo de Desempenho (RN.70).
- **UC.019:** Fila de Processamento Assíncrono para Relatórios Pesados (RN.38, RN.40).
- **UC.020:** Monitoramento de SLA e Métricas de Saúde (RN.44).

## Módulo 5: LGPD e Privacidade
- **UC.021:** Gestão de Documentos Legais e Versão de Termos (RN.31).
- **UC.022:** Controle de Consentimentos Granulares por Finalidade (RN.45).
- **UC.023:** Atendimento ao Direito de Portabilidade (Exportação JSON/ZIP) (RN.34).
- **UC.024:** Log de Auditoria Imutável de Acessos a Dados Sensíveis (RN.63).
- **UC.025:** Fluxo de Exclusão Lógica e Anonimização de Dados (RN.32).

## Módulo 6: Gamificação
- **UC.026:** Conquista Automática de Selos por Mérito Acadêmico (RN.52).
- **UC.027:** Exibição de Ranking Escolar Dinâmico (RN.51).

## Módulo 7: Secretaria e Financeiro
- **UC.028:** Validação de Documentação Obrigatória para Matrícula (RN.71).
- **UC.029:** Geração e Cobrança de Mensalidades com Juros Automáticos (RN.74, RN.75).
- **UC.030:** Workflow de Transferência entre Turmas/Escolas (RN.11).
