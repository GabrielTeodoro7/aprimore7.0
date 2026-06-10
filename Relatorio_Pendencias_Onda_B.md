# Relatório de Pendências — Onda B (LGPD / Privacidade)

> Fonte: `Relatório_Aprimore_1-2.docx` (16.063 linhas após conversão para Markdown).
> Escopo: somente requisitos **explicitamente documentados** com tag `(LGPD)` ou relacionados a privacidade/dados pessoais/dados sensíveis. Nada inventado.

---

## 1. Requisitos identificados no documento

| RN | Título (texto literal do documento) | Tag |
|----|-------------------------------------|-----|
| RN.05 | Aceite Obrigatório de Termos e Reaceitação por Versionamento | LGPD |
| RN.31 | Soft Delete com Preservação de Histórico | Privacidade/Retenção |
| RN.32 | Anonimização de Dados Pessoais após Prazo de Retenção Legal | LGPD |
| RN.34 | Exportação de Dados do Titular e Portabilidade | LGPD |
| RN.45 | Registro de Consentimento por Finalidade | LGPD |
| RN.46 | Relatório de Impacto à Proteção de Dados (RIPD) Automatizado | LGPD |
| RN.63 | Registro de Acesso a Dados Sensíveis com Justificativa | LGPD |
| RNF.22* | Privacidade por Padrão (mascaramento) — **ver Ambiguidade #1** | Privacidade |

\* O resumo executivo cita "Privacidade por Padrão (RNF.22)", mas o catálogo de RNFs lista `RNF.22 — Plano de Continuidade de Negócio (BCP) e Disaster Recovery`. Conflito a confirmar.

---

## 2. Status atual no código (Onda B = todos os itens abaixo estão ❌ ou ⚠️)

| RN | Frontend | Banco/Supabase | Backend Java | Status global |
|----|----------|---------------|--------------|---------------|
| **RN.05 — Aceite de Termos versionado** | ❌ Sem modal irremovível, sem checkbox no signup, sem reaceitação pós-login | ❌ Tabelas `documentos_legais` e `termos_aceitos` inexistentes | ❌ Sem endpoints `/termos/aceitar`, filtro `termos_pendentes` ausente | ❌ Não implementado |
| **RN.31 — Soft Delete** | ❌ UI usa DELETE físico (`alunos.functions.ts` etc.) | ❌ Sem coluna `deletado_em` em alunos/turmas/avaliações/PDIs/usuários | ❌ Sem serviço de soft delete no Java | ❌ Não implementado |
| **RN.32 — Anonimização após 5 anos** | ❌ Sem mensagem "Dados anonimizados conforme LGPD" na ficha | ❌ Sem colunas `anonimizado` (boolean) e `data_desligamento` em `alunos`. Sem job mensal. | ❌ Sem `@Scheduled` mensal, sem serviço de anonimização | ❌ Não implementado |
| **RN.34 — Exportação/Portabilidade** | ❌ Tela "Privacidade > Exportar Meus Dados" inexistente | ❌ Sem registro de auditoria `EXPORTACAO_DADOS`, sem limite mensal | ❌ Sem endpoint `/api/v1/lgpd/exportar/meus-dados`, sem job ZIP (JSON+CSV) | ❌ Não implementado |
| **RN.45 — Consentimento por finalidade** | ❌ Tela "Privacidade e Consentimentos" inexistente | ❌ Tabela `consentimentos` inexistente (finalidades: CADASTRO, IMAGEM, COMUNICACOES, COMPARTILHAMENTO) | ❌ Sem endpoint `/lgpd/consentimentos`, sem verificação pré-tratamento | ❌ Não implementado |
| **RN.46 — RIPD trimestral** | ❌ Painel DPO inexistente | ❌ Sem agregação trimestral | ❌ Sem `@Scheduled` trimestral, sem geração de PDF | ❌ Não implementado |
| **RN.63 — Acesso a dados sensíveis** | ⚠️ CPF já está visível sem mascaramento; sem modal de justificativa | ❌ Tabela `logs_acesso_sensiveis` inexistente | ❌ Sem interceptor, sem endpoint `/acesso/sensiveis` | ❌ Não implementado |
| **RNF.22 — Privacidade por Padrão*** | ❌ Dados sensíveis exibidos sem mascaramento padrão | ❌ Sem regras de mascaramento | ❌ Sem camada de mascaramento | ❌ Não implementado (sujeito à Ambiguidade #1) |

✅ Já parcialmente coberto pela **Onda A**: auditoria imutável (`audit_logs` com triggers REVOKE/BLOCK) — usada como base para registrar consentimentos, exportações e acessos sensíveis.

---

## 3. Ambiguidades a resolver antes de implementar

| # | Item | Pergunta |
|---|------|----------|
| **A1** | RNF.22 citado duas vezes com conteúdos distintos (BCP vs. Privacidade por Padrão) | Tratar **ambos** os significados como válidos (conforme sua diretriz Q1) e implementar o mascaramento como item separado? Ou descartar e cobrir apenas via RN.63? |
| **A2** | RN.32 cita "5 anos após desligamento" mas o schema atual não tem `data_desligamento` nem fluxo de desligamento de aluno | Criar coluna + fluxo administrativo de desligamento agora ou apenas preparar a infraestrutura (coluna + job) e deixar o fluxo de desligamento para uma onda posterior? |
| **A3** | RN.34 menciona "S3 + link assinado validade 7 dias" | Sem bucket S3 configurado. Aceita-se Supabase Storage (bucket privado `lgpd-exports` + signed URL 7 dias) como equivalente arquitetural? |
| **A4** | RN.46 RIPD gera **PDF trimestral** via job `@Scheduled` Java | Backend Java atual roda como app standalone (Main.java) sem scheduler ativo. Aceita-se incluir scheduler ScheduledExecutorService no Java + endpoint manual `/ripd/gerar` para acionamento sob demanda enquanto o agendador não está em produção? |
| **A5** | RN.05 prevê tabela `documentos_legais` com texto completo + versionamento | Os textos de Termos/Política existem? Devo criar versões iniciais "2026.1" stub (lorem ipsum legal) ou aguardar você fornecer os textos definitivos? |
| **A6** | RN.63 distingue "acesso fora do contexto normal" | Definir "contexto normal" como: Professor → apenas alunos das próprias turmas; Admin → todos da própria escola; CEO → todos. OK? |

---

## 4. Plano proposto de implementação (após sua aprovação)

Divisão da Onda B em **3 sub-fases**, cada uma com build verde + relatório antes da próxima:

### B.1 — Fundação (Schema + Backend Java + tipos)
- **Banco (Supabase migration):**
  - `documentos_legais`, `termos_aceitos` (RN.05)
  - `consentimentos` (RN.45)
  - `logs_acesso_sensiveis` (RN.63)
  - Coluna `deletado_em timestamptz` em alunos/turmas/atividades/avaliações/profiles (RN.31)
  - Coluna `anonimizado boolean default false`, `data_desligamento date` em `alunos` (RN.32)
  - View `v_alunos_ativos` (filtra `deletado_em IS NULL AND anonimizado = false`)
  - RLS + GRANTs para todas as novas tabelas
- **Backend Java (novas classes seguindo padrão `escola.*`):**
  - `escola.model.DocumentoLegal`, `TermoAceito`, `Consentimento`, `LogAcessoSensivel`
  - `escola.dao.DocumentoLegalDAO`, `TermoAceitoDAO`, `ConsentimentoDAO`
  - `escola.service.TermosService`, `ConsentimentoService`, `AnonimizacaoService`, `ExportacaoLgpdService`, `RipdService`
  - `escola.exceptions.LgpdException`, `ConsentimentoAusenteException`, `TermosNaoAceitosException`
  - `escola.threads.JobAnonimizacao` (executa o algoritmo do RN.32 — execução manual via `Main`)
  - `escola.threads.JobRipd` (executa agregação trimestral do RN.46)

### B.2 — Aceite de Termos e Consentimentos (RN.05, RN.45)
- Frontend: signup com checkbox; modal irremovível de reaceitação; tela `/privacidade/consentimentos`
- Server functions: `aceitarTermos`, `verificarTermosPendentes`, `salvarConsentimento`, `listarConsentimentos`
- Backend Java: `TermosService.aceitar()`, `ConsentimentoService.upsert()` com auditoria

### B.3 — Direitos do titular e acesso sensível (RN.31, RN.32, RN.34, RN.46, RN.63)
- Soft delete em todas as functions afetadas
- Tela `/privacidade/exportar-dados` + job de geração ZIP (JSON+CSV) via Supabase Storage
- Mascaramento de CPF/dados sensíveis + modal de justificativa
- Painel DPO `/admin/ripd` com lista de relatórios

---

## 5. Impacto previsto

| Área | Impacto |
|------|---------|
| Frontend | +6 rotas novas, +4 componentes (`ModalReaceitacao`, `MascaramentoSensivel`, `ExportarDadosCard`, `ConsentimentoSwitch`) |
| Server functions | +12 funções em `src/lib/lgpd.functions.ts`, `consentimentos.functions.ts`, `termos.functions.ts` |
| Supabase | +4 tabelas, +7 colunas, +1 view, +2 triggers (block anonimização indevida; auto-set `deletado_em`) |
| Backend Java | +4 modelos, +3 DAOs, +5 serviços, +2 threads, +3 exceptions, 0 remoções |
| Regressão | Risco baixo — todas as alterações são aditivas. Soft delete substitui DELETE físico em **3** funções (`alunos.functions.ts`, `turmas.functions.ts`, `atividades.functions.ts`) — preservando comportamento via filtro padrão `deletado_em IS NULL`. |

---

## 6. Próximo passo (aguardando aprovação)

**Por favor responda às ambiguidades A1–A6 acima** e confirme se posso iniciar pela **sub-fase B.1 (Fundação)**. Nenhum arquivo será alterado até sua confirmação.
