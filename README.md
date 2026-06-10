# Aprimore Educação

Plataforma educacional inclusiva com IA, acessibilidade e múltiplos perfis
(aluno, professor, admin, CEO).

## Estrutura do repositório

```
/                       → frontend (TanStack Start + React + Tailwind)
  src/                  → código da plataforma usada por alunos e equipe
  supabase/             → migrations e config do banco (Lovable Cloud)
backend-java/           → código-fonte Java de referência acadêmica
                         (NÃO precisa estar rodando para a plataforma funcionar)
```

### Frontend
- **Stack:** TanStack Start, React 19, Tailwind, shadcn/ui.
- **IA:** Lovable AI Gateway via `src/lib/ai.functions.ts` (server functions).
- **Acessibilidade:** painel global + descrição de imagens por IA.
- **Perfis:** aluno, professor, admin, CEO (painel executivo).

Rodar local:
```bash
bun install
bun dev
```

### `backend-java/` — material de apoio acadêmico

A pasta contém um projeto Java Maven que demonstra a implementação dos
**14 tópicos obrigatórios de POO/Java** exigidos no trabalho:

1. Classes e Objetos
2. Construtores
3. Encapsulamento
4. Herança
5. Interfaces
6. Classes Abstratas
7. Polimorfismo
8. Coleções do Java
9. Java IO
10. Enum em Java
11. Exceções do Java
12. Thread
13. Java Swing (substituído por geração de PDF)
14. JDBC

O backend Java **não é consumido pelo frontend** — ele existe apenas como
evidência da implementação dos conceitos. O professor pode inspecionar o
código diretamente em `backend-java/src/`.

Compilar e executar local (VS Code):
```bash
cd backend-java
mvn compile
mvn exec:java -Dexec.mainClass=escola.Main
mvn exec:java -Dexec.mainClass=escola.demo.DemoJDBC
mvn exec:java -Dexec.mainClass=escola.demo.DemoSwing
```

## Correções de IA aplicadas nesta versão

O erro "Nenhum objeto gerado: a resposta não corresponde ao esquema" era
exibido para o usuário quando a IA respondia em texto puro ou JSON inválido.

O que mudou:

- Novo helper `src/lib/ai-safe.ts` com `safeGenerateObject()` que:
  1. Tenta `generateObject` normalmente (schema estrito).
  2. Se falhar, refaz a chamada com `generateText` e tenta extrair JSON
     usando regex (incluindo blocos ```json``` e remoção de vírgulas
     pendentes).
  3. Se ainda falhar, devolve um **fallback amigável tipado** definido por
     cada handler — a interface nunca quebra.
- Todas as 14 server functions em `src/lib/ai.functions.ts` foram
  reescritas para usar `safeGenerateObject`.
- A landing (`src/routes/index.tsx`) agora exibe uma mensagem lúdica
  ("🤔 Desculpe, estou aprendendo… Quer tentar outra pergunta?") em vez
  do erro técnico.
- Os prompts foram revisados para usar **linguagem simples, lúdica e
  encorajadora** adequada ao ensino fundamental e médio (emojis, exemplos
  do cotidiano — pizza 🍕, mochila, futebol, brinquedos).
- Removida a menção a "14 tópicos Java" do painel CEO de insights — o
  conteúdo Java fica apenas no diretório `backend-java/`, não aparece para
  os alunos.

## Como testar as correções da IA

1. **Demo da landing:** abra `/` → escreva uma necessidade no demo
   ("Aluno de 9 anos com TDAH") → clique em **Gerar plano**.
   - Caminho feliz: aparece o plano com título, resumo, passos e adaptação.
   - Caminho de erro (desligue a internet ou esgote créditos): a interface
     mostra a mensagem amigável, nunca o erro técnico.
2. **Tutor do aluno:** `/aluno/tutor` → faça uma pergunta. Se a IA não
   responder no formato esperado, aparece a resposta padrão pedindo pra
   reformular.
3. **Painel CEO:** `/ceo` continua intacto (login → auditoria, insights,
   override, usuários, observar).
4. **Demos de IA do professor:** `/professor/ia`, `/inclusao`,
   `/aluno/sentimentos`, `/relatorios`, `/atividades/novo`, `/mensagens`
   — todas usam o mesmo helper e nunca exibem o erro de schema.

## Regressão verificada

- Painel CEO mantido (todas as rotas `ceo.*`).
- Demos de IA preservadas — só recebem fallback transparente.
- Acessibilidade, assistente flutuante, rotas de aluno/professor/admin
  intocadas.
- Nenhuma referência visível a Java, POO, JDBC etc. no produto final.
