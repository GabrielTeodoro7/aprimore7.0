# Relatório — Onda A (Núcleo Educacional + Auditoria Imutável)

Data: 2026-06-06
Status do build TypeScript: **✅ limpo (0 erros)**
Status do schema Supabase: **✅ regenerado, types.ts sincronizado**

---

## 1. Arquivos alterados

| Arquivo | Tipo | Descrição |
|---|---|---|
| `supabase/migrations/20260606_063618_onda_a.sql` | novo | Migração consolidada da Onda A |
| `src/lib/cpf.ts` | já existia | Algoritmo CPF (front) |
| `src/lib/alunos.functions.ts` | editado | Persiste/valida `cpf` no `criarAluno` e expõe no `listarAlunos` |
| `src/integrations/supabase/types.ts` | regenerado | Reflete nova coluna `cpf` e `capacidade` |

---

## 2. Regras de negócio implementadas

| RN | Descrição | Onde |
|---|---|---|
| RN.01 — CPF válido | CPF do aluno opcional, único, validado pelos dígitos verificadores | `alunos.cpf` (DB + Zod) |
| RN.07 — Capacidade da turma | Não é possível matricular mais alunos do que a `capacidade` da turma | trigger `trg_check_turma_capacidade` |
| RN.12 — Data de frequência válida | Não permite datas futuras nem anteriores a 2000-01-01 | constraint `frequencia_data_valida` |
| RN.18 — Faixa de nota (avaliações) | `media ∈ [0,10]`, `peso ∈ [1,10]`, `data ≤ hoje` | constraints `avaliacoes_*` |
| RN.19 — Faixa de nota (submissões) | `nota ∈ [0,10]`, `status ∈ {pendente,entregue,corrigida,atrasada}` | constraints `submissoes_*` |
| RN.41 — Auditoria imutável | `audit_logs` aceita apenas INSERT; UPDATE/DELETE bloqueados a todos | trigger `trg_audit_logs_immutable` + `REVOKE` |

---

## 3. Triggers criadas

- **`trg_check_turma_capacidade`** em `public.alunos` (BEFORE INSERT/UPDATE OF turma_id)
  Verifica `count(alunos) < turmas.capacidade`. Lança `check_violation` se exceder.
- **`trg_audit_logs_immutable`** em `public.audit_logs` (BEFORE UPDATE OR DELETE)
  Lança `insufficient_privilege` em qualquer tentativa de alterar/excluir um log.

## 4. Functions criadas

- **`public.is_valid_cpf(text) → boolean`** — IMMUTABLE, reaproveitável em CHECK constraints.
- **`public.check_turma_capacidade()`** — SECURITY DEFINER (necessário para ler `turmas` ignorando RLS de leitura por aluno).
- **`public.block_audit_mutation()`** — bloqueia UPDATE/DELETE em `audit_logs`.

## 5. Constraints adicionadas

| Tabela | Constraint | Regra |
|---|---|---|
| `alunos` | `alunos_cpf_valido` | `is_valid_cpf(cpf)` |
| `alunos` | `alunos_cpf_unique` (índice único parcial) | CPF normalizado único quando preenchido |
| `turmas` | `turmas_capacidade_positiva` | `0 < capacidade ≤ 200` |
| `frequencia` | `frequencia_data_valida` | `'2000-01-01' ≤ data ≤ hoje` |
| `avaliacoes` | `avaliacoes_media_range` | `media ∈ [0,10]` ou NULL |
| `avaliacoes` | `avaliacoes_peso_range` | `peso ∈ [1,10]` |
| `avaliacoes` | `avaliacoes_data_nao_futura` | `data ≤ hoje` |
| `submissoes` | `submissoes_nota_range` | `nota ∈ [0,10]` ou NULL |
| `submissoes` | `submissoes_status_valido` | enum de status |

## 6. Novas colunas

- `alunos.cpf TEXT NULL` (opcional, validado, único)
- `turmas.capacidade INTEGER NOT NULL DEFAULT 30`

## 7. Impacto no sistema

- **Compatibilidade**: nenhuma quebra. Todas as colunas novas têm default ou são opcionais. Constraints só rejeitam dados inválidos novos — dados pré-existentes (banco está vazio para entidades de negócio) não são afetados.
- **Performance**: trigger de capacidade faz `count(*) WHERE turma_id = ?` (rápido com índice em FK). Imutabilidade de auditoria é zero-custo no caminho de INSERT.
- **Segurança**: privilégios UPDATE/DELETE em `audit_logs` revogados de `authenticated` e `anon`. Apenas `service_role` poderia tentar (e ainda assim é bloqueado pelo trigger).
- **Avisos do linter**: 10 WARN sobre SECURITY DEFINER são **esperados e intencionais** — confirmado pelo usuário; são necessários para o modelo de RLS.

---

## 8. Como testar cada funcionalidade

### CPF
```sql
-- ✅ Deve passar
INSERT INTO alunos (nome, turma_id, cpf) VALUES ('Ana', '<uuid>', '529.982.247-25');
-- ❌ Deve falhar: CPF inválido
INSERT INTO alunos (nome, turma_id, cpf) VALUES ('Bia', '<uuid>', '111.111.111-11');
-- ❌ Deve falhar: CPF duplicado (mesmo após normalização)
INSERT INTO alunos (nome, turma_id, cpf) VALUES ('Ana2', '<uuid>', '52998224725');
```
Front: cadastro de aluno em `/admin/alunos` rejeita CPF inválido antes do submit (Zod) e o servidor é a segunda barreira.

### Capacidade da turma
```sql
UPDATE turmas SET capacidade = 2 WHERE id = '<t>';
-- Insira 2 alunos: ok. O 3º deve falhar com "Turma X atingiu a capacidade máxima (2)."
```

### Frequência
```sql
-- ❌ Deve falhar (data futura)
INSERT INTO frequencia (turma_id, aluno_id, data, presente)
  VALUES ('<t>','<a>', CURRENT_DATE + 1, true);
```

### Avaliações / Submissões
```sql
-- ❌ Falha: nota > 10
INSERT INTO avaliacoes (turma_id, professor_id, titulo, media, peso) VALUES (...,15,1);
-- ❌ Falha: peso 0
INSERT INTO avaliacoes (..., peso) VALUES (..., 0);
-- ❌ Falha: status inválido
INSERT INTO submissoes (atividade_id, aluno_id, status) VALUES (...,'rascunho');
```

### Auditoria imutável
```sql
INSERT INTO audit_logs (entidade, acao) VALUES ('aluno','create');
-- ❌ Ambos devem falhar
UPDATE audit_logs SET acao='x' WHERE entidade='aluno';
DELETE FROM audit_logs WHERE entidade='aluno';
```

---

## 9. Próximas ondas

- **Onda B (LGPD)**: consentimento, mascaramento de PII, retenção, export/erase.
- **Onda C (Acessibilidade/PDI)**: planos individualizados, recursos inclusivos.
- **Onda D (Novos módulos)**: financeiro, biblioteca, transporte, calendário.

Aguardando aprovação para iniciar a **Onda B**.
