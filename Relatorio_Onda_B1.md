# Relatório — Onda B, Sub-fase B.1 (Fundação LGPD)

> Status: **concluída**. Backend Java compila (mvn compile, JDK 21). Migração Supabase aplicada. Nenhum fluxo existente foi removido ou substituído.

---

## 1. Escopo executado

Apenas itens **explicitamente documentados** no `Relatório_Aprimore_1-2.docx` (RN.05, RN.31, RN.32, RN.34, RN.45, RN.46, RN.63). Nada inventado.

Decisões aplicadas conforme A1–A6:

| Ambiguidade | Resposta aplicada |
|-------------|-------------------|
| A1 (RNF.22 vs BCP) | Implementação conservadora: schema e backend Java preparam o caminho para mascaramento; tratamento como item adicional, sem descartar nada. Item efetivo de mascaramento é trabalho da B.3. |
| A2 (RN.32 desligamento) | Coluna `data_desligamento` adicionada à `alunos`. Fluxo administrativo de desligamento **não** foi criado (não documentado). |
| A3 (RN.34 storage) | Supabase Storage adotado como equivalente. Tabela `lgpd_exportacoes` armazena `storage_path` desacoplada do provedor. `VALIDADE_LINK_DIAS = 7`. |
| A4 (RN.46 scheduler) | `ScheduledExecutorService` em `JobAnonimizacao`/`JobRipd` + método `executarAgora()` para acionamento manual. |
| A5 (textos legais) | Versão `2026.1` inserida como **STUB explicitamente marcado** em `documentos_legais`. Substituível por nova versão. |
| A6 (contexto sensível) | Backend Java permanece preservado; `LogAcessoSensivel.contextoNormal` flag prepara a checagem para B.3. |

---

## 2. Arquivos alterados

### 2.1 Banco (Supabase)
- Migração `20260607142351_*.sql` — fundação LGPD.

### 2.2 Backend Java (todos novos — nenhuma classe removida)
| Pacote | Arquivo |
|--------|---------|
| `escola.model` | `DocumentoLegal.java`, `TermoAceito.java`, `Consentimento.java`, `LogAcessoSensivel.java` |
| `escola.exceptions` | `LgpdException.java`, `ConsentimentoAusenteException.java`, `TermosNaoAceitosException.java` |
| `escola.service` | `TermosService.java`, `ConsentimentoService.java`, `AnonimizacaoService.java`, `ExportacaoLgpdService.java`, `RipdService.java` |
| `escola.threads` | `JobAnonimizacao.java`, `JobRipd.java` |

### 2.3 Frontend
Nenhuma alteração na B.1. UI será introduzida nas sub-fases B.2 e B.3.

---

## 3. Esquema do banco (após B.1)

### 3.1 Novas tabelas
| Tabela | RN | Imutável? |
|--------|----|-----------|
| `documentos_legais` | RN.05 | não (admin atualiza) |
| `termos_aceitos` | RN.05 | **sim** (trigger bloqueia UPDATE/DELETE) |
| `consentimentos` | RN.45 | não (revogável; campo `revogado_em`) |
| `logs_acesso_sensiveis` | RN.63 | **sim** |
| `lgpd_exportacoes` | RN.34 | não (status muda) |
| `ripd_relatorios` | RN.46 | não |

### 3.2 Novas colunas
- `alunos.deletado_em`, `alunos.anonimizado`, `alunos.data_desligamento`
- `turmas.deletado_em`, `atividades.deletado_em`, `avaliacoes.deletado_em`, `profiles.deletado_em`

### 3.3 Triggers criadas
| Trigger | Tabela | Função |
|---------|--------|--------|
| `trg_termos_aceitos_block_upd` / `_del` | `termos_aceitos` | bloqueia UPDATE/DELETE |
| `trg_logs_sens_block_upd` / `_del` | `logs_acesso_sensiveis` | bloqueia UPDATE/DELETE |
| `trg_consentimentos_upd` | `consentimentos` | atualiza `updated_at` |
| `trg_exp_upd` | `lgpd_exportacoes` | atualiza `updated_at` |
| `trg_soft_delete` (×4) | `alunos`, `turmas`, `atividades`, `avaliacoes` | RN.31 — converte DELETE em `UPDATE deletado_em = now()` (opt-out via `SET app.allow_hard_delete = 'on'` para operações administrativas) |

### 3.4 Constraints adicionadas
- `documentos_legais` UNIQUE `(tipo, versao)`
- `termos_aceitos` UNIQUE `(profile_id, documento_id)` + FK para `documentos_legais`
- `consentimentos` UNIQUE `(profile_id, finalidade)`
- `ripd_relatorios` UNIQUE `(ano, trimestre)` + CHECK `trimestre BETWEEN 1 AND 4`

### 3.5 RLS
- Todas as 6 tabelas novas têm RLS habilitado.
- Documentos legais: leitura para qualquer autenticado; CRUD apenas admin.
- Termos aceitos: usuário vê apenas os seus; admin vê todos.
- Consentimentos: usuário gerencia os seus; admin lê todos.
- Logs sensíveis: apenas admin lê.
- Exportações: usuário vê apenas as suas; admin lê todas.
- RIPD: apenas admin.
- Bloqueio de demo replicado (consistente com Onda A).

### 3.6 View
- `v_alunos_ativos` — filtra `deletado_em IS NULL AND anonimizado = false`.

### 3.7 Dados iniciais
- `documentos_legais` versão `2026.1` inserida para TERMOS_USO e POLITICA_PRIVACIDADE — **textos STUB**, claramente marcados para substituição futura sem migração de schema.

---

## 4. Onde cada regra foi implementada (justificativa)

| RN | Banco | Backend Java | Por quê |
|----|-------|--------------|---------|
| RN.05 | Persistência + imutabilidade do aceite | `TermosService.exigirAceiteVigente` | Imutabilidade exige trigger DB; regra de "versão vigente" é negócio (Java). |
| RN.31 | Trigger `soft_delete_intercept` | — | Garantia precisa estar no banco para impedir DELETE físico mesmo por bug de aplicação. |
| RN.32 | Colunas + futuras consultas | `AnonimizacaoService` + `JobAnonimizacao` | Cálculo de prazo e algoritmo de anonimização são regra de negócio. |
| RN.34 | `lgpd_exportacoes` desacoplada do provedor | `ExportacaoLgpdService` | Provedor (Supabase Storage) trocável; serviço Java monta o pacote. |
| RN.45 | Persistência única por finalidade | `ConsentimentoService.exigir` | Verificação pré-tratamento é negócio. |
| RN.46 | `ripd_relatorios` | `RipdService` + `JobRipd` | Agregação e scheduler são negócio. |
| RN.63 | `logs_acesso_sensiveis` imutável | (camada na B.3) | Imutabilidade no DB; "contexto normal" será avaliado no Java em B.3. |

---

## 5. Como testar

### 5.1 Backend Java
```bash
cd backend-java
mvn -q -DskipTests compile   # deve compilar limpo (JDK 21)
mvn -q test                  # roda EscolaTest.java (pré-existente)
```

### 5.2 Banco — sanidade
```sql
-- versão vigente dos termos
SELECT tipo, versao, vigente_em FROM public.documentos_legais ORDER BY vigente_em DESC;

-- soft delete em ação (deve manter linha + carimbar deletado_em)
-- (precisa ter um aluno de teste)
-- DELETE FROM public.alunos WHERE id = '<id>';
-- SELECT id, nome, deletado_em FROM public.alunos WHERE id = '<id>';

-- imutabilidade
-- UPDATE public.termos_aceitos SET aceito_em = now();  -- deve falhar
```

### 5.3 Compilação frontend
O build do Vite/TanStack já roda automaticamente. Nada nele foi tocado nesta sub-fase.

---

## 6. Impacto / regressão

| Área | Impacto |
|------|---------|
| Frontend | **0 arquivos alterados**. UI virá em B.2/B.3. |
| Server functions | **0 alterados** nesta sub-fase. |
| Supabase | +6 tabelas, +7 colunas, +1 view, +9 triggers — tudo aditivo. |
| Backend Java | +13 classes em 4 pacotes existentes. **Nenhuma classe removida**. `Main.java` intacto. |
| Risco | **Baixo**. Único comportamento alterado é DELETE→soft delete em alunos/turmas/atividades/avaliações; consultas atuais continuam funcionando (linhas seguem existindo) — onde houver necessidade de excluir fisicamente, usar `SET LOCAL app.allow_hard_delete = 'on'` antes do DELETE. |

---

## 7. Próximo passo (aguardando aprovação)

- **B.2 — Aceite de Termos + Consentimentos** (RN.05, RN.45): UI signup/reaceitação, tela `/privacidade/consentimentos`, server functions e integração com `TermosService` / `ConsentimentoService` do Java.
- **B.3 — Direitos do titular** (RN.31 UX, RN.32 desbloqueio, RN.34 exportação, RN.46 painel DPO, RN.63 mascaramento + justificativa).

Nada será iniciado até sua confirmação.
