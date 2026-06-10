# Checkpoint Fase 1 — Auditoria Completa dos Casos de Uso

Data: 2026-06-10
Status: Iniciando auditoria sistemática.

Este checkpoint formaliza a estratégia de auditoria para os casos de uso derivados das 603 páginas do documento mestre, garantindo a cobertura total das RNs e RNFs.

## 1. Estratégia de Catalogação
- **Leitura Exaustiva:** Revisão sistemática das seções de requisitos e fluxos do documento.
- **Extração Atômica:** Identificação de cada interação usuário-sistema como um Caso de Uso (UC) independente.
- **Hierarquização:** Agrupamento por módulos (Acadêmico, Financeiro, Secretaria, Segurança, IA, LGPD).

## 2. Estimativa de Casos de Uso
- **Volume Estimado:** Aproximadamente 120 a 150 Casos de Uso únicos mapeados através das 161 regras de negócio.

## 3. Artefatos e Arquivos a Gerar
- `Relatorio_CasosDeUso_Catalogacao.md`: Lista bruta de todos os UCs identificados.
- `Relatorio_CasosDeUso_Mapeamento.md`: Matriz de rastreabilidade (UC -> RN -> Tela -> Backend -> Banco).
- `Relatorio_CasosDeUso_Auditoria.md`: Diagnóstico de status (Implementado, Parcial, Ausente).

## 4. Critérios de Auditoria
- **Implementado:** Código funcional no Frontend, tipos no Supabase e lógica equivalente no Java.
- **Parcial:** Existe em uma camada mas falta integração ou persistência completa.
- **Ausente:** Nenhuma evidência de código encontrada para o UC específico.

## 5. Critérios de Implementação (Fase 2)
- Respeito estrito ao `strict: true` e `noImplicitAny`.
- Manutenção do paradigma acadêmico no Backend Java com comentários didáticos.
- Zero deleção de funcionalidades validadas nas Ondas A a D.

## 6. Impacto Esperado
- Cobertura de 100% dos requisitos funcionais.
- Eliminação de "pontas soltas" na experiência do usuário.
- Garantia de que a aplicação é um reflexo fiel das 603 páginas de especificação.

---
**Próximo Passo:** Gerar `Relatorio_CasosDeUso_Catalogacao.md`.
