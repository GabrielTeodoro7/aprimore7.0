# Relatório de Mapeamento de Casos de Uso (UC)

Este relatório mapeia cada Caso de Uso às suas respectivas camadas de implementação (RN, Tela, Backend Java, Banco e Arquivos).

| UC | RN | Tela/Rota | Backend Java | Banco (Tabela) | Arquivo(s) Chave |
|:---|:---|:---|:---|:---|:---|
| UC.001 | RN.35 | `/auth/signup` | `DominioService.java` | `dominios_institucionais` | `dominio_email_permitido` (SQL) |
| UC.002 | RN.02 | `/auth/login` | `SegurancaService.java` | `tentativas_login` | `bloqueios_conta` |
| UC.003 | RN.01 | `/settings/password`| `SenhaService.java` | `senha_historico` | `politica_senha` |
| UC.007 | RN.13 | `/alunos/novo` | `MatriculaService.java`| `alunos` | `is_valid_cpf` (SQL) |
| UC.008 | RN.14 | `/frequencia` | `AcademicoService.java`| `frequencia` | `Relatorio_Onda_A.md` |
| UC.010 | RN.17 | `/notas` | `NotaService.java` | `avaliacoes`, `submissoes`| `Nota.java` |
| UC.011 | RN.19 | `/pdi` | `PDIService.java` | `pdis`, `pdi_metas` | `Pdi.java` |
| UC.013 | RN.24 | `/comunicacao` | `PranchaService.java` | `pranchas_comunicacao` | `pranchas_comunicacao.functions.ts`|
| UC.015 | RN.37 | `/perfil/settings` | `AcessibilidadeService`| `preferencias_acessibilidade`| `preferencias_acessibilidade.ts` |
| UC.017 | RN.42 | Global | `MultiTenantService` | `escolas`, `profiles` | `escola_id` (coluna) |
| UC.018 | RN.70 | `/dashboard/bi` | `BiService.java` | `bi_consolidado_turma` | `v_bi_comparativo_escolas` (View)|
| UC.022 | RN.45 | `/auth/consent` | `SoftDeleteService` | `consentimentos` | `consentimentos` (Tabela) |
| UC.025 | RN.32 | `/admin/alunos` | `SoftDeleteService` | `alunos` (deletado_em) | `soft_delete_intercept` (Trigger)|
| UC.026 | RN.52 | `/perfil/badges` | `GamificacaoService` | `selos`, `conquistas_aluno`| `Selo.java` |
| UC.029 | RN.75 | `/financeiro` | `Mensalidade.java` | `financeiro_mensalidades` | `calcularTotalComJuros` (Java) |

*(Mapeamento completo disponível para consulta interna; resumido aqui para os fluxos principais).*
