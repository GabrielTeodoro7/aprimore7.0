# Relatório de Catalogação de Casos de Uso (UC)

Este relatório cataloga todos os casos de uso identificados nas 603 páginas do documento, segmentados por módulos.

## Módulo 1: Segurança e Identidade (RN.01 - RN.07, RN.35, RN.61, RN.62)
- **UC.001:** Cadastrar novo usuário com validação de domínio institucional (RN.35).
- **UC.002:** Efetuar login com proteção contra força bruta e bloqueio progressivo (RN.02).
- **UC.003:** Alterar senha respeitando complexidade e histórico de 5 versões (RN.01).
- **UC.004:** Recuperar senha via token único anti-enumeração (RN.07).
- **UC.005:** Detectar anomalias de acesso (dispositivo/geolocalização) (RN.61).
- **UC.006:** Forçar troca de senha após expiração (180 dias) (RN.62).

## Módulo 2: Núcleo Educacional (RN.08 - RN.18, RN.47 - RN.49)
- **UC.007:** Matricular aluno validando CPF e capacidade da turma (RN.13).
- **UC.008:** Registrar frequência diária com trava de retroatividade (RN.14).
- **UC.009:** Justificar faltas com anexo em até 48h (RN.15).
- **UC.010:** Lançar notas vinculadas a bimestres e avaliações (RN.17).
- **UC.011:** Fechar bimestre impedindo alterações posteriores (RN.16).
- **UC.012:** Consultar histórico escolar consolidado (RN.18).

## Módulo 3: Educação Inclusiva e PDI (RN.19 - RN.23)
- **UC.013:** Elaborar Plano de Desenvolvimento Individual (PDI) (RN.19).
- **UC.014:** Definir metas de PDI com prazos de vigência (RN.20).
- **UC.015:** Registrar progresso de metas com comentários obrigatórios (RN.21).
- **UC.016:** Emitir alertas de metas de PDI vencidas (RN.22).

## Módulo 4: Acessibilidade e Comunicação (RN.24 - RN.28, RN.37)
- **UC.017:** Personalizar prancha de comunicação alternativa (RN.24).
- **UC.018:** Enviar mensagens privadas com moderação/denúncia (RN.25).
- **UC.019:** Configurar preferências de acessibilidade sincronizadas (RN.37).
- **UC.020:** Receber notificações com retry exponencial em caso de falha (RN.26).

## Módulo 5: LGPD e Privacidade (RN.29 - RN.34, RN.45, RN.46)
- **UC.021:** Aceitar Termos de Uso e Política de Privacidade (versão específica) (RN.31).
- **UC.022:** Gerenciar consentimentos granulares por finalidade (RN.45).
- **UC.023:** Solicitar exportação de dados pessoais (Direito de Portabilidade) (RN.34).
- **UC.024:** Visualizar logs de acesso a dados sensíveis (Transparência) (RN.63).
- **UC.025:** Executar exclusão lógica (Soft Delete) e anonimização (RN.32).

## Módulo 6: Multi-tenant e BI (RN.41 - RN.44, RN.65 - RN.70)
- **UC.026:** Isolar dados entre diferentes escolas (Multi-tenant) (RN.42).
- **UC.027:** Visualizar dashboards de BI com comparativo entre unidades (RN.70).
- **UC.028:** Gerar relatórios analíticos assíncronos (Fila de processamento) (RN.38).

## Módulo 7: Gamificação (RN.51, RN.52)
- **UC.029:** Conquistar selos por desempenho ou comportamento (RN.52).
- **UC.030:** Consultar ranking de pontos da escola (RN.51).

## Módulo 8: Secretaria e Financeiro (RN.71 - RN.77)
- **UC.031:** Validar documentação obrigatória de matrícula (RN.71).
- **UC.032:** Consultar mensalidades e gerar boletos/PIX (RN.74).
- **UC.033:** Aplicar juros e multas automaticamente em atrasos (RN.75).

*(Nota: Catalogação contínua acompanhando as 603 páginas)*
