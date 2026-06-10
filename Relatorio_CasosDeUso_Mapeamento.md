# Relatório de Mapeamento de Casos de Uso

| Caso de Uso | RN | Tela | Backend | Banco | Status |
|-------------|----|------|---------|-------|--------|
| UC.001 (Cadastro Domínio) | RN.35 | `/auth/signup` | `dominio_email_permitido` | `dominios_institucionais` | Implementado |
| UC.002 (Login/Bloqueio) | RN.02 | `/auth/login` | `SegurancaService.java` | `tentativas_login`, `bloqueios_conta` | Implementado |
| UC.003 (Complexidade Senha) | RN.01 | `/settings/password` | `SenhaService.java` | `senha_historico`, `politica_senha` | Implementado |
| UC.007 (Matrícula/CPF) | RN.13 | `/alunos/novo` | `is_valid_cpf` (SQL) | `alunos (check constraint)` | Implementado |
| UC.008 (Frequência) | RN.14 | `/turmas/[id]/frequencia` | `AcademicoService.java` | `frequencia` | Implementado |
| UC.017 (Pranchas) | RN.24 | `/comunicacao/pranchas` | `PranchaService.java` | `pranchas_comunicacao` | Implementado |
| UC.019 (Acessibilidade) | RN.37 | `/perfil/acessibilidade` | `AcessibilidadeService.java` | `preferencias_acessibilidade` | Implementado |
| UC.021 (Termos/LGPD) | RN.31 | `/auth/consent` | `SoftDeleteService.java` | `termos_aceitos`, `documentos_legais` | Implementado |
| UC.026 (Multi-tenant) | RN.42 | Global | `MultiTenantService.java` | `escolas (escola_id)` | Implementado |
| UC.029 (Selos/Gamificação) | RN.52 | `/perfil/conquistas` | `GamificacaoService.java` | `selos`, `conquistas_aluno` | Implementado |
| UC.031 (Docs Secretaria) | RN.71 | `/secretaria/documentos` | `SecretariaService.java` | `documentos_aluno` | Implementado |
| UC.032 (Mensalidades) | RN.74 | `/financeiro` | `Mensalidade.java` | `financeiro_mensalidades` | Implementado |
| UC.033 (Juros/Multa) | RN.75 | N/A (Lógica) | `Mensalidade.calcularTotalComJuros` | `financeiro_config` | Implementado |

*(Mapeamento em expansão para cobrir UCs de IA e Offline)*
