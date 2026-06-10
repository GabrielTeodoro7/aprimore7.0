# Relatório Onda B.3 — Direitos do Titular (LGPD)

Data: 2026-06-09

## Escopo

Implementação dos requisitos remanescentes da Onda B:

| RN | Tema | Status |
|----|------|--------|
| RN.31 | Soft Delete (preservação de histórico) | ✅ Banco + Java |
| RN.34 | Exportação/Portabilidade | ✅ FE + Storage + Java |
| RN.46 | RIPD trimestral (DPO) | ✅ FE + Storage + Java |
| RN.63 | Acesso a dados sensíveis com justificativa | ✅ FE + Banco + Java |
| RNF.22* | Privacidade por Padrão (mascaramento) | ✅ Componente `SensitiveField` |

\*Conforme A1, RNF.22 foi tratada como camada de privacidade por padrão (mascaramento), além do significado de BCP listado no catálogo.

## Arquivos criados

### Frontend / Server Functions
- `src/lib/lgpd.functions.ts` — server functions:
  - `solicitarExportacaoDados` (RN.34) — gera JSON do titular, grava em `lgpd-exports/{userId}/...` e devolve Signed URL de 7 dias.
  - `listarMinhasExportacoes` (RN.34) — histórico do titular.
  - `registrarAcessoSensivel` (RN.63) — insere em `logs_acesso_sensiveis` com justificativa ≥ 10 chars; calcula `contexto_normal` (regra A6).
  - `gerarRipd` (RN.46) — agrega contagens trimestrais e grava em `lgpd-exports/ripd/...`. Apenas admin/CEO.
  - `listarRipds`, `obterSignedUrlRipd` — leitura para o painel DPO.
- `src/components/SensitiveField.tsx` — componente de mascaramento com modal de justificativa (RNF.22 + RN.63).
- `src/routes/privacidade.exportar.tsx` — tela "Exportar meus dados".
- `src/routes/admin.ripd.tsx` — painel DPO (admin/CEO) com geração on-demand e download.

### Frontend / alterações
- `src/routes/privacidade.tsx` — adicionado bloco "Direitos do titular" com link para `/privacidade/exportar`.

### Banco / Storage
- Bucket privado **`lgpd-exports`** criado.
- Migration de RLS em `storage.objects`:
  - Usuário lê apenas a própria pasta (`{userId}/...`).
  - `service_role` gerencia todos os objetos do bucket.
  - Admin/CEO leem a subpasta `ripd/`.

### Backend Java (escola.*)
- `escola/service/LogAcessoSensivelService.java` — POJO `RegistroAcesso`, enum `Campo`, validação de justificativa (RN.63).
- `escola/service/SoftDeleteService.java` — interface `SoftDeletavel` + método genérico `excluirLogicamente`/`restaurar` (RN.31).
- Já existentes e reutilizados: `ExportacaoLgpdService`, `RipdService`, `AnonimizacaoService`, `JobRipd`, `JobAnonimizacao`.

## Mapeamento dos 14 conteúdos acadêmicos nas novas classes

| # | Conteúdo | Onde apareceu nesta onda |
|---|----------|--------------------------|
| 5 | Interfaces | `SoftDeleteService.SoftDeletavel` |
| 6 | Polimorfismo | `excluirLogicamente(T)` aceita qualquer `SoftDeletavel` |
| 7 | Enums | `LogAcessoSensivelService.Campo` |
| 8 | Encapsulamento / POJO | `RegistroAcesso` (campos `final` + getters) |
| 9 | Tratamento de exceções | Validação de justificativa lança `IllegalArgumentException` |
| 11 | Genéricos | `<T extends SoftDeletavel>` em `SoftDeleteService` |

`CONTEUDOS_JAVA.md` continuará sendo atualizado a cada onda.

## Como testar

### Frontend
1. Login como usuário comum → acesse `/privacidade` → clique em "Exportar meus dados" → confira histórico em `/privacidade/exportar`.
2. Login como admin/CEO → `/admin/ripd` → "Gerar RIPD do trimestre atual" → baixe o JSON.
3. Em qualquer tela com `SensitiveField` (a ser plugado nas telas admin de aluno em onda futura), clique no olho → modal exige justificativa ≥ 10 chars → acesso aparece em `logs_acesso_sensiveis`.

### Backend Java (local no VS Code)
```bash
cd backend-java
mvn compile          # compila tudo (compilador externo)
mvn exec:java -Dexec.mainClass=escola.demo.DemoJDBC     # demo JDBC
mvn exec:java -Dexec.mainClass=escola.demo.DemoSwing    # demo Swing
```
Os serviços novos (`LogAcessoSensivelService`, `SoftDeleteService`) são bibliotecas chamadas pelo `Main.java` / pelas threads.

## Compatibilidade local no VS Code

- Nenhum endpoint ou arquivo existente foi removido.
- Estrutura `escola.*` preservada; classes apenas adicionadas.
- `demo/DemoSwing.java` e `demo/DemoJDBC.java` permanecem isolados.

## Ambiguidades resolvidas

- **A1** — Mascaramento implementado como camada separada via `SensitiveField`.
- **A3** — Supabase Storage (`lgpd-exports`) usado como equivalente arquitetural ao S3, com Signed URL de 7 dias.
- **A4** — `RipdService` exposto também como endpoint manual (`gerarRipd`) enquanto o scheduler trimestral roda em `JobRipd`.
- **A6** — `contexto_normal` calculado em `registrarAcessoSensivel`: CEO sempre normal; admin normal apenas se mesma escola.

## Próximos passos sugeridos (fora do escopo da B.3)

- Plugar `<SensitiveField />` nas telas administrativas existentes que mostram CPF/notas individuais.
- Implementar fluxo administrativo de "desligamento de aluno" (RN.32) que dispara `JobAnonimizacao` após 5 anos.
- Substituir DELETEs físicos remanescentes em server functions por update de `deletado_em` (trigger já intercepta no banco — verificação adicional).
