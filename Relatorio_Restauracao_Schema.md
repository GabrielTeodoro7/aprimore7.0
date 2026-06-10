# Relatório de Restauração de Schema

## 1. Migrations
- **Total de migrations aplicadas:** 28
- **Lista de migrations:**
  - 20260525194349_828c90ee-609e-4a00-ab25-32354ad59144.sql
  - 20260525202200_avaliacoes.sql
  - 20260525203500_onda_c.sql
  - 20260525205248_8fa49960-b45d-470a-bf75-026f0df2908c.sql
  - 20260525205834_71f61b9f-02ae-462d-9e55-e378a9d29c29.sql
  - 20260526000308_29cd22d8-9009-4a62-bb71-6524c3fb25c0.sql
  - 20260606063123_b0e58461-32ad-470c-b839-dd3e6f25cd98.sql
  - 20260606063615_fe9bfb30-998b-4cc4-b122-4aaba546d50d.sql
  - 20260607142347_30e54650-0e94-4385-bb74-25fc9c3e8064.sql
  - 20260609005151_a1d36f2d-b211-4f22-8218-275bc89fc48b.sql
  - 20260610000100_onda_c_seguranca_base.sql
  - 20260610000200_onda_c_jwt_refresh.sql
  - 20260610000300_onda_c_recuperacao_senha.sql
  - 20260610000400_onda_c_dominios_email.sql
  - 20260610000500_onda_c_anomalias_acesso.sql
  - 20260610013009_12a16138-35f6-4ae7-98b6-7db717a5b3ba.sql
  - 20260610013036_aa2194b0-2753-4005-888c-9835c8912a6e.sql
  - 20260610013313_ac3d0b33-a2ac-47bc-a5b1-11f0132e0fd7.sql
  - 20260610013339_370bbb09-c4ba-48cd-94ba-8d9e25199eae.sql
  - 20260610013412_0ade3fad-ac70-4115-8b6f-b4ede98dbced.sql
  - 20260610013433_ea94ba31-9309-4827-910e-0d80e057e78d.sql
  - 20260610013455_4da77def-843f-44ba-823d-115f8f0e9446.sql
  - 20260610013520_35559218-1236-4f59-815b-b7bb2accd04b.sql
  - 20260610013545_8e35df12-cd24-4699-a12c-d1439fa8995e.sql
  - 20260610040000_onda_c3_acessibilidade_comunicacao.sql
  - 20260610050000_onda_c4_operacao_configuracao.sql
  - 20260610060000_onda_d_multi_tenant.sql
  - 20260610060100_onda_d_gamificacao.sql

## 2. Tabelas Restauradas
- profiles, user_roles, turmas, alunos, atividades, atividade_alunos, submissoes, frequencia, mensagens, comunicados, sentimentos, conquistas, audit_logs, avaliacoes, rotina_itens, notificacoes, documentos_legais, termos_aceitos, consentimentos, politica_senha, logs_acesso_sensiveis, lgpd_exportacoes, ripd_relatorios, tentativas_login, bloqueios_conta, refresh_tokens, tokens_recuperacao_senha, dominios_institucionais, anomalias_acesso, preferencias_acessibilidade, pranchas_comunicacao, denuncias_mensagem, senha_historico, feriados, limites_plano, escolas, selos, conquistas_aluno.

## 3. Views Restauradas
- v_alunos_ativos

## 4. Functions Restauradas
- senha_precisa_trocar
- soft_delete_intercept
- dominio_email_permitido
- is_valid_cpf
- check_turma_capacidade
- block_audit_mutation

## 5. Triggers Restauradas
- Triggers de data de atualização (updated_at) para todas as tabelas relevantes.
- trg_soft_delete (Interceptação de deleção para soft delete).
- trg_audit_logs_immutable (Bloqueio de mutação em logs).
- trg_check_turma_capacidade.

## 6. Policies RLS Restauradas
- Total de policies aplicadas garante isolamento por `user_id`, `professor_id` e permissões de `admin`/`ceo`.

## 7. Tipagem TypeScript
- **types.ts regenerado:** Sim.
- **Database type is not never:** Confirmado (contém definições completas do schema public).

## 8. Verificação de Compilação
- **bunx tsc --noEmit:** Sucesso.
- **mvn compile:** Ambiente sem Maven instalado (verificado via comando `mvn`).

---
Data: 2026-06-10
Status: Concluído
