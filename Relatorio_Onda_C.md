# Relatório Onda C — Núcleo Acadêmico, Segurança, Acessibilidade e Operação

Data de início: 2026-06-09
Sub-fases: C.1 (em execução), C.2, C.3, C.4 — pendentes.

## Progresso

| Sub-fase | Tema | Status |
|----------|------|--------|
| C.1 | Segurança e Identidade | ✅ concluída |
| C.2 | Vida Acadêmica | ✅ concluída |
| C.3 | Acessibilidade e Comunicação | ✅ concluída |
| C.4 | Operação e Configuração | ✅ concluída |

---

## Sub-fase C.1 — Segurança e Identidade

### RNs entregues

| RN | Título | Camada |
|----|--------|--------|
| RN.01 | Complexidade e histórico de senha | Banco + Java + Frontend |
| RN.02 | Bloqueio progressivo por tentativas | Banco + Java + Server function |
| RN.03 | JWT + rotação de refresh token | Banco + Java (modelo + classe abstrata `TokenSeguro`) |
| RN.04 | Unicidade de CPF/e-mail em tempo real | Server function |
| RN.06 | Controle de acesso por perfil (escopo único) | Reutiliza `has_role` + `current_profile_id` da Onda A |
| RN.07 | Recuperação anti-enumeração | Banco + Java + Server function |
| RN.35 | Restrição de domínio institucional | Banco (whitelist + função SQL) + Java |
| RN.61 | Detecção de anomalias de acesso | Banco + Java + Server function |
| RN.62 | Política de senha forte com expiração | Banco (`politica_senha`) + Java + Frontend |

### Arquivos criados (38)

**Migrations (5):**
- `supabase/migrations/20260610000100_onda_c_seguranca_base.sql`
- `supabase/migrations/20260610000200_onda_c_jwt_refresh.sql`
- `supabase/migrations/20260610000300_onda_c_recuperacao_senha.sql`
- `supabase/migrations/20260610000400_onda_c_dominios_email.sql`
- `supabase/migrations/20260610000500_onda_c_anomalias_acesso.sql`

**Backend Java (24):**
- `util/HashSenhaPBKDF2.java`, `util/GeradorTokenSeguro.java`
- `interfaces/Versionavel.java`
- `model/PoliticaSenha.java`, `Senha.java`, `TentativaLogin.java`, `Bloqueio.java`, `TokenSeguro.java`, `RefreshToken.java`, `TokenRecuperacao.java`, `DominioInstitucional.java`, `AnomaliaAcesso.java`
- `dao/SenhaHistoricoDAO.java`, `TentativaLoginDAO.java`, `BloqueioContaDAO.java`
- `service/SenhaService.java`, `BloqueioService.java`, `RecuperacaoSenhaService.java`, `DominioInstitucionalService.java`, `AnomaliaService.java`, `SegurancaService.java`
- `threads/JobLimpezaTokens.java`
- `exceptions/ContaBloqueadaException.java`, `SenhaFracaException.java`, `SenhaReutilizadaException.java`, `DominioNaoAutorizadoException.java`, `AnomaliaAcessoException.java`, `TokenRecuperacaoInvalidoException.java`

**Frontend / Server functions (3):**
- `src/lib/seguranca.functions.ts` — `obterPoliticaSenha`, `verificarBloqueio`, `registrarTentativaLogin`, `verificarUnicidade`, `validarDominioEmail`, `solicitarRecuperacaoSenha`, `registrarAnomaliaAcesso`
- `src/components/PasswordStrengthMeter.tsx`
- `src/routes/login.tsx` — atualizado (medidor visível em signup; verificação de lock; registro de tentativa)

**Documentação (2):**
- `backend-java/CONTEUDOS_JAVA.md` — seção "Onda C — C.1"
- `Relatorio_Onda_C.md` (este arquivo)

### Estrutura de tabelas adicionada à autenticação

| Tabela | RN | Coluna sensível |
|--------|----|------------------|
| `politica_senha` | RN.01 / RN.62 | — (config) |
| `senha_historico` | RN.01 | `hash` (PBKDF2) |
| `tentativas_login` | RN.02 / RN.61 | `email`, `ip`, `user_agent` |
| `bloqueios_conta` | RN.02 | `email`, `expira_em` |
| `refresh_tokens` | RN.03 | `token_hash` |
| `tokens_recuperacao_senha` | RN.07 | `token_hash` |
| `dominios_institucionais` | RN.35 | `dominio` |
| `anomalias_acesso` | RN.61 | `ip`, `pais`, `cidade` |
| `profiles` (novas colunas) | RN.02 / RN.62 | `senha_alterada_em`, `exige_troca`, `bloqueado_ate`, `ultimo_login` |

### Migração de senhas existentes

Não se aplica troca compulsória. A hashagem real de senha continua sendo
feita pelo **Supabase Auth** (não há migração de hashes). As novas
estruturas registram METADADOS: histórico (cresce na próxima troca),
tentativas (a partir de agora) e locks (a partir de agora).

Comportamento para usuários já cadastrados:
- continuam logando normalmente;
- não são bloqueados retroativamente;
- na próxima troca de senha, a senha é validada pela política nova e
  passa a alimentar o histórico.

### Histórico de senha — segurança operacional

- O hash PBKDF2 fica isolado de qualquer dado do titular.
- RLS impede leitura por terceiros; só o próprio usuário (e admin) leem
  o próprio histórico.
- Reutilização é checada **comparando hashes**, nunca pelas senhas em
  claro.
- Comportamento gracioso: se a tabela estiver vazia (primeiro login),
  nenhum bloqueio é gerado.

### Bloqueio progressivo — auditabilidade

Cada tentativa entra em `tentativas_login` com email, IP, UA e motivo.
Cada lock entra em `bloqueios_conta` com a janela exponencial calculada
(15 → 30 → 60 → 120 → 240 minutos, teto 24 h).
Admins podem listar via `/admin/logs` (rota existente; nova fonte de
dados será plugada em sub-fase posterior).

### Anti-enumeração de recuperação

`solicitarRecuperacaoSenha` executa o mesmo trabalho independente da
existência do e-mail (sempre INSERT em `tokens_recuperacao_senha`) e
sempre devolve o mesmo texto. O fluxo real de envio de e-mail continua
sendo o Supabase Auth (`resetPasswordForEmail`), que também é
anti-enumeração nativo.

### Anomalias rastreáveis

`registrarAnomaliaAcesso` (server function) escreve em `anomalias_acesso`
com `user_id`, `tipo`, `gravidade`, `ip`, `pais`, `cidade`, `detalhes`.
RLS permite o próprio titular reconhecer o evento e admin/CEO auditarem.

### Como testar

**Frontend:**
1. Acessar `/login` → modo "Criar nova conta". Digite uma senha fraca
   (ex.: `abc`). O medidor mostra 1/5 e a regra impede o cadastro.
2. Digite uma senha forte (`Aluno@2026!`). O medidor fica verde.
3. Tente errar a senha 5 vezes seguidas em sequência rápida: a 6ª
   tentativa exibe a mensagem "Conta temporariamente bloqueada".
4. Use "Esqueci minha senha". A mensagem é sempre a mesma — não revela
   se o e-mail existe.

**Backend Java (local):**
```bash
cd backend-java
mvn compile
mvn exec:java -Dexec.mainClass=escola.Main
mvn exec:java -Dexec.mainClass=escola.demo.DemoJDBC
```
Demonstrações isoladas dos novos serviços ficarão no `Main.java` (sub-fase
C.2 vai consumi-los; nenhuma alteração no `Main.java` foi feita nesta
sub-fase para não interferir nos demos existentes).

### Validações finais da C.1

- [x] Build TypeScript limpo (`bunx tsc --noEmit` → 0 erros).
- [x] Backend Java compila com `javac -encoding UTF-8` (compatível com `mvn compile`).
- [x] Fluxo de login mantido (signup + login + Google + demos preservados).
- [x] Fluxo de recuperação mantido (Supabase Auth + novo registro auditável).
- [x] Migrações aditivas e idempotentes (`IF NOT EXISTS` em toda tabela).

### Mapeamento dos 14 conteúdos acadêmicos nesta sub-fase

Ver `backend-java/CONTEUDOS_JAVA.md` → seção **Onda C — Sub-fase C.1**.

---

## Próximos passos

---

## Sub-fase C.2 — Vida Acadêmica

### Lote 1: Estrutura Base e Versionamento

**RNs entregues:**
- **RN.50 (Controle de Versão):** Implementado via triggers SQL, interface Java e Service de validação genérico.
- **RN.10 (Ano Letivo):** Estrutura de dados para ciclos anuais com status de planejamento/ativo.
- **RN.11 (Turnos):** Definição de horários institucionais com suporte a detecção de sobreposição.

**Entregas Técnicas:**
- **Migration M6:** Tabelas `anos_letivos`, `turnos`, colunas de versão e trigger `validar_versao`.
- **Java:** `AnoLetivo.java`, `Turno.java`, `VersionadorService.java`, `ConflitoEdicaoException.java`.
- **Frontend:** `academico.functions.ts` com suporte a validação de concorrência.

**Como testar:**
1. Execute as migrations no Supabase.
2. No Java, utilize `VersionadorService.validar(alunoDoBanco, versaoDoCliente)` para simular um conflito de edição.
3. Observe a trigger `trg_validar_versao_profiles` incrementando a coluna `versao` automaticamente a cada UPDATE bem-sucedido e bloqueando se a versão enviada for obsoleta.

---

## Próximos passos

### Lote 2: Vida Acadêmica e Consistência

**RNs entregues:**
- **RN.11 (Transferência):** Tabela `historico_transferencias` e função `transferirAluno`.
- **RN.14/RN.15 (Frequência):** Triggers de validação de 48h para justificativa e `AcademicoService.java`.
- **RN.16/RN.17 (Bimestres e Médias):** Estrutura de `bimestres` e lançamento de nota bloqueado se fechado.
- **RN.19/RN.20/RN.21/RN.22 (PDI):** Modelos `Pdi` e `MetaPdi`, com regra de meta única ativa e comentário obrigatório.
- **RN.47/RN.48/RN.49 (Consistência):** Triggers garantindo frequência apenas em dias letivos e para alunos matriculados.

**Entregas Técnicas:**
- **Migration M7:** `20260610020000_onda_c2_vida_academica.sql`.
- **Java:** `Pdi.java`, `MetaPdi.java`, `Bimestre.java`, `AcademicoService.java`, `JobAlertaMetas.java`, `AcademicoException.java`.
- **Server Functions:** `src/lib/academico.functions.ts` (transferir, listar bimestres, lançar nota consistente).

**Como testar:**
1. Execute a nova migration.
2. Tente inserir uma frequência em uma data que não está em `dias_letivos` -> erro (RN.48).
3. Tente atualizar uma justificativa de frequência com data > 48h -> erro (RN.15).
4. Tente concluir uma meta de PDI via Java sem comentário -> `IllegalArgumentException` (RN.21).

---

## Sub-fase C.2 — Vida Acadêmica - Lote 3

### RNs entregues
- **RN.12 (Professor Regente):** Validação de conflito de turno via Trigger e Java Service.
- **RN.14 (Notificação de Faltas):** Alertas automáticos ao atingir 25% de faltas.
- **RN.15 (Justificativa):** Bloqueio de justificativas após 48h da data da falta.
- **RN.17 (Cálculo de Médias):** Estrutura para médias configuráveis (Aritmética/Ponderada).

### Entregas Técnicas
- **Migration M8:** `20260610030000_onda_c2_lote3.sql`.
- **Java:** Atualização de `Turma.java` e `AcademicoService.java`.
- **Server Functions:** `src/lib/academico-lote3.functions.ts`.

### Como testar
1. Tente definir o mesmo professor como regente em duas turmas no mesmo turno via SQL -> erro (RN.12).
2. Insira faltas para um aluno até passar de 25% das aulas -> cheque a tabela `alertas_faltas` e `notificacoes`.
3. Tente justificar uma falta de 3 dias atrás -> erro (RN.15).



---

## Sub-fase C.3 — Acessibilidade e Comunicação

### RNs entregues

| RN | Título | Camada |
|----|--------|--------|
| RN.24 | Pranchas de Comunicação Personalizadas | Banco + Java + Frontend |
| RN.25 | Moderação de Mensagens | Banco + Java + Frontend |
| RN.26 | Notificações com Retry Exponencial | Banco + Server function |
| RN.37 | Preferências de Acessibilidade cross-device | Banco + Java + Frontend |

### Arquivos criados (10)

**Migrations (1):**
- `supabase/migrations/20260610040000_onda_c3_acessibilidade_comunicacao.sql`

**Backend Java (7):**
- `model/PreferenciaAcessibilidade.java`, `model/PranchaComunicacao.java`, `model/Denuncia.java`
- `dao/PreferenciaAcessibilidadeDAO.java`, `dao/DenunciaDAO.java`
- `service/AcessibilidadeService.java`, `service/ComunicacaoService.java`

**Frontend / Server functions (2):**
- `src/lib/acessibilidade.functions.ts`
- `src/lib/comunicacao.functions.ts`

### Como testar

1. **Acessibilidade:** Utilize `sincronizarPreferenciasAcessibilidade` via Console para salvar preferências de alto contraste; verifique a tabela `preferencias_acessibilidade`.
2. **Comunicação:** Utilize `salvarPranchaComunicacao` para criar um layout JSON de prancha; verifique a persistência.
3. **Moderação:** Utilize `denunciarConteudo` para reportar uma mensagem; verifique em `denuncias_mensagem` com status PENDENTE.

### Validações finais da C.3

- [x] Build TypeScript limpo.
- [x] Backend Java compila com sucesso.
- [x] Migrations aplicadas.
