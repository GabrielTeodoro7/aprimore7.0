# Checkpoint — Pré Sub-fase C.1

Data: 2026-06-09
Status: aguardando início da execução da Onda C (38 regras aprovadas).

Este checkpoint formaliza, antes de qualquer alteração, **todos os artefatos
previstos para a Onda C**. Nenhum item fora desta lista será criado sem
nova aprovação. Tudo é aditivo; nada existente será removido.

---

## 1. Tabelas novas (Supabase / Postgres)

Total: **22 tabelas** + 4 colunas em tabelas existentes + 2 views.

### Bloco C.1 — Segurança e Identidade (9 tabelas)
1. `senha_historico` — últimas 5 senhas (hash PBKDF2) por usuário (RN.01, RN.62).
2. `tentativas_login` — registro de cada tentativa (RN.02, RN.61).
3. `bloqueios_conta` — locks temporários com janela exponencial (RN.02).
4. `refresh_tokens` — rotação de refresh JWT (RN.03).
5. `tokens_recuperacao_senha` — token único, expirável, anti-enumeração (RN.07).
6. `dominios_institucionais` — whitelist de domínios de e-mail (RN.35).
7. `anomalias_acesso` — geolocalização, dispositivo, horário atípico (RN.61).
8. `politica_senha` — configuração por escola/global (RN.01, RN.62).
9. `cpf_email_index` (view materializada opcional) — checagem de unicidade em tempo real (RN.04).

Colunas novas:
- `profiles.senha_alterada_em TIMESTAMPTZ`
- `profiles.exige_troca BOOLEAN DEFAULT false`
- `profiles.bloqueado_ate TIMESTAMPTZ`
- `profiles.ultimo_login TIMESTAMPTZ`

### Bloco C.2 — Vida Acadêmica (8 tabelas)
10. `transferencias` — histórico imutável + bloqueio de retroatividade (RN.11, RN.66 fica para D).
11. `justificativas_falta` — anexo, prazo de 48 h, status (RN.15).
12. `bimestres` — status (aberto/fechado), data corte (RN.16).
13. `notas` — vinculadas a bimestre + avaliação (RN.16, RN.17, RN.18, RN.47).
14. `pdis` — `aluno_id` único quando ativo (RN.19).
15. `pdi_metas` — prazo dentro da vigência (RN.20).
16. `pdi_progresso` — comentário obrigatório (RN.21).
17. `versionamento_registros` — coluna `version` + trigger para edição concorrente (RN.50).

Colunas/views novas:
- `alunos.data_nascimento_consistente` (trigger RN.10)
- `turmas.turno` + check de conflito (RN.12)
- `frequencia.bimestre_id` (RN.48)
- View `v_dias_letivos` (RN.48)
- View `v_consistencia_freq_matricula` (RN.49)

### Bloco C.3 — Acessibilidade e Comunicação (3 tabelas)
18. `denuncias_mensagem` — moderação e workflow (RN.25).
19. `preferencias_acessibilidade` — sincronização cross-device (RN.37).
20. `pranchas_comunicacao` — JSON do layout personalizado (RN.24).

Coluna nova:
- `notificacoes.canal_preferido` + `notificacoes.tentativas` (RN.26 — retry exponencial).

### Bloco C.4 — Operação (2 tabelas)
21. `ano_letivo` + `feriados` (RN.29). *(contadas como duas, totalizando 22)*
22. `feriados` — datas + tipo (RN.29).
+ `api_keys` — chaves hash + escopo + expiração (RN.33).
+ `relatorios_jobs` — fila de geração assíncrona (RN.38).
+ `metricas_saude` — coleta agregada para SLA (RN.44).
+ `limites_plano` — leitura do plano contratado (RN.30).

> Observação: total final fica em **27 tabelas físicas** (a numeração 22
> acima conta apenas o "núcleo"). O delta total foi recalculado para
> precisão neste checkpoint.

---

## 2. Migrations previstas

Todas com `IF NOT EXISTS`, GRANT, ENABLE RLS, políticas, e comentário inicial
descritivo. Uma migration por bloco temático para facilitar revisão.

| # | Arquivo | Conteúdo | RNs |
|---|---------|----------|-----|
| M1 | `20260610000100_onda_c_seguranca_base.sql` | senha_historico, tentativas_login, bloqueios_conta, politica_senha, colunas em profiles | RN.01, RN.02, RN.62 |
| M2 | `20260610000200_onda_c_jwt_refresh.sql` | refresh_tokens + rotação | RN.03 |
| M3 | `20260610000300_onda_c_recuperacao_senha.sql` | tokens_recuperacao_senha | RN.07 |
| M4 | `20260610000400_onda_c_dominios_email.sql` | dominios_institucionais + seed | RN.35 |
| M5 | `20260610000500_onda_c_anomalias_acesso.sql` | anomalias_acesso + view de alertas | RN.61 |
| M6 | `20260610010100_onda_c_transferencias.sql` | transferencias + trigger anti-retroativa | RN.11 |
| M7 | `20260610010200_onda_c_bimestres_notas.sql` | bimestres, notas, check < max, link bimestre status | RN.16, RN.17, RN.18, RN.47 |
| M8 | `20260610010300_onda_c_pdi.sql` | pdis, pdi_metas, pdi_progresso + unique ativo | RN.19, RN.20, RN.21, RN.22 |
| M9 | `20260610010400_onda_c_frequencia_consistencia.sql` | justificativas_falta, link `frequencia.bimestre_id`, views | RN.14, RN.15, RN.48, RN.49 |
| M10 | `20260610010500_onda_c_versionamento.sql` | coluna `version` + trigger em alunos/avaliacoes/pdis | RN.50 |
| M11 | `20260610010600_onda_c_turma_turno.sql` | coluna `turno`, validação RN.12 e RN.10 | RN.10, RN.12 |
| M12 | `20260610020100_onda_c_acessibilidade.sql` | preferencias_acessibilidade, pranchas_comunicacao | RN.24, RN.37 |
| M13 | `20260610020200_onda_c_comunicacao_moderacao.sql` | denuncias_mensagem, status, RLS | RN.25 |
| M14 | `20260610020300_onda_c_notificacoes_retry.sql` | coluna canal_preferido, tentativas, status | RN.26 |
| M15 | `20260610030100_onda_c_ano_letivo.sql` | ano_letivo, feriados, exclusion constraint sobreposição | RN.29 |
| M16 | `20260610030200_onda_c_limites_plano.sql` | limites_plano + função `pode_criar` | RN.30 |
| M17 | `20260610030300_onda_c_api_keys.sql` | api_keys + hash + escopo | RN.33 |
| M18 | `20260610030400_onda_c_relatorios_jobs.sql` | relatorios_jobs, fila | RN.38, RN.40 |
| M19 | `20260610030500_onda_c_metricas_saude.sql` | metricas_saude, alertas SLA | RN.44 |
| M20 | `20260610040100_onda_c_periodo_matricula.sql` | janela de matrícula | RN.64 |

Total: **20 migrations** (cada uma idempotente; reversível via rollback
manual documentado no próprio cabeçalho do arquivo).

---

## 3. Classes Java previstas (`escola.*`)

Total: **51 classes** novas. Nenhuma classe atual será removida.

### `escola.model` (+18 classes)
`PoliticaSenha`, `Senha`, `TentativaLogin`, `Bloqueio`, `RefreshToken`,
`TokenRecuperacao`, `DominioInstitucional`, `AnomaliaAcesso`,
`Transferencia`, `Bimestre`, `Nota`, `PDI`, `Meta`, `ProgressoMeta`,
`Justificativa`, `AnoLetivo`, `Feriado`, `ApiKey`, `RelatorioJob`,
`MetricaSaude`, `Denuncia`, `PreferenciaAcessibilidade`,
`PranchaComunicacao`, `LimitePlano`.

### `escola.dao` (+12 classes)
DAOs equivalentes para entidades acima (`SenhaDAO`, `TentativaLoginDAO`,
`TransferenciaDAO`, `NotaDAO`, `PDIDAO`, `MetaDAO`, `JustificativaDAO`,
`AnoLetivoDAO`, `ApiKeyDAO`, `RelatorioJobDAO`, `DenunciaDAO`,
`PreferenciaAcessibilidadeDAO`).

### `escola.service` (+13 classes)
`SegurancaService`, `SenhaService`, `BloqueioService`,
`RecuperacaoSenhaService`, `AnomaliaService`, `TransferenciaService`,
`NotaService`, `MediaService`, `PDIService`, `JustificativaService`,
`AnoLetivoService`, `ApiKeyService`, `RelatorioAssincronoService`,
`SaudeService`, `ComunicacaoService` (estende), `AcessibilidadeService`,
`PranchaService`, `LimitePlanoService`.

### `escola.threads` (+4 classes)
`JobFaltasExcessivas`, `JobMetasVencidas`, `JobRelatorios`, `JobSaude`,
`JobLimpezaTokens`.

### `escola.exceptions` (+8 classes)
`ContaBloqueadaException`, `SenhaFracaException`, `SenhaReutilizadaException`,
`ConflitoEdicaoException`, `BimestreFechadoException`,
`JustificativaForaPrazoException`, `ApiKeyInvalidaException`,
`LimitePlanoExcedidoException`, `AnomaliaAcessoException`,
`DominioNaoAutorizadoException`.

### `escola.util` (+4 classes)
`HashSenhaPBKDF2` (algoritmo PBKDF2WithHmacSHA256, 200k iterações, salt
16 B), `Versionador`, `CalculadoraMedia`, `ValidadorIdadeSerie`,
`GeradorTokenSeguro` (SecureRandom + Base64URL).

### `escola.interfaces` (+2 interfaces)
`Versionavel`, `Notificavel`.

---

## 4. Conteúdos acadêmicos reforçados na Onda C

| # | Conteúdo | Onde aparece nesta onda |
|---|----------|--------------------------|
| 1 | Classes e Objetos | Todos os 18 modelos POJO (`Senha`, `Bimestre`, `Nota`, etc.) |
| 2 | Construtores | Construtores `final`-only nos modelos imutáveis (`Bloqueio`, `Transferencia`) e construtores sobrecarregados em `Nota` (com/sem bimestre) |
| 3 | Encapsulamento | Campos `private final` + getters; senha jamais exposta (`HashSenhaPBKDF2` retorna apenas hash) |
| 4 | Herança | `Bimestre extends PeriodoLetivo`, `RefreshToken extends TokenSeguro`, novos modelos derivam de `Pessoa` quando aplicável |
| 5 | Interfaces | `Versionavel` (RN.50), `Notificavel` (RN.22/RN.26), reutilização de `Relatorio` |
| 6 | Classes Abstratas | `TokenSeguro` (base de `RefreshToken` e `TokenRecuperacao`), `PeriodoLetivo` |
| 7 | Polimorfismo | `Versionador.atualizar(Versionavel)` aceita qualquer entidade versionada; `Notificavel.notificar()` |
| 8 | Coleções | `Map<Long, Bloqueio>`, `List<TentativaLogin>` em `BloqueioService`, `Queue<RelatorioJob>` na fila |
| 9 | Java IO | `RelatorioAssincronoService` grava CSV/PDF em `relatorios/` via `BufferedWriter` e `Files.write` |
| 10 | Enum | `StatusBimestre`, `StatusJustificativa`, `CanalNotificacao`, `EscopoApiKey`, `GravidadeAnomalia` |
| 11 | Exceções | 10 novas exceptions específicas, exemplos de `throws` checadas e runtime |
| 12 | Thread | `ScheduledExecutorService` em `JobFaltasExcessivas`, `JobMetasVencidas`, `JobSaude`, `JobLimpezaTokens`; `ReentrantLock` em `BloqueioService` |
| 13 | Swing | `DemoSwing` continua intocado; será apenas referenciado |
| 14 | JDBC | Todos os DAOs novos usam `PreparedStatement`, `ResultSet`, transações com `Connection.setAutoCommit(false)` |

`CONTEUDOS_JAVA.md` ganhará a seção **"Onda C"** com este mapa replicado e
referência direta aos arquivos.

---

## 5. Confirmação de premissas

- **Idempotência**: todas as migrations usam `IF NOT EXISTS` e `ADD COLUMN IF NOT EXISTS`.
- **RLS + GRANT**: cada tabela nova recebe `ENABLE ROW LEVEL SECURITY` e os GRANTs apropriados antes das policies.
- **PBKDF2**: usado via `javax.crypto.SecretKeyFactory` — zero dependência Maven adicional.
- **Escopo único**: nenhum `escola_id` em massa; RN.06 implementado via verificação de papel sem multi-tenant.
- **Compatível com VS Code local**: nenhum recurso depende de infraestrutura externa (S3, Redis, Kafka).
- **Comentários didáticos**: padrão `// O QUE / POR QUÊ / QUANDO / CONCEITO Java` em toda classe nova.

---

## 6. Próximo passo imediato

Iniciar **Sub-fase C.1 — Segurança e Identidade** com:

1. Migration **M1** `20260610000100_onda_c_seguranca_base.sql`
2. Migration **M2** `20260610000200_onda_c_jwt_refresh.sql`
3. Classes Java do bloco de segurança (`HashSenhaPBKDF2`, `GeradorTokenSeguro`, modelos, DAOs, `SegurancaService`, exceptions, `JobLimpezaTokens`)
4. Server functions `src/lib/seguranca.functions.ts`
5. Atualização parcial de `CONTEUDOS_JAVA.md` e `Relatorio_Onda_C.md` (seção C.1)
