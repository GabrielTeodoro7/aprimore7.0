# Configuração de Ambiente para VS Code e Local

Este arquivo serve como base para garantir que o projeto funcione 100% no VS Code sem erros de chaves ausentes.

## Variáveis de Ambiente Necessárias (.env)

Copie o conteúdo abaixo para um arquivo chamado `.env` na raiz do projeto (fora das pastas src/backend):

```env
# IA - Chave fixa da Aprimore Education
LOVABLE_API_KEY=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

# Supabase - Dados do projeto yfthrzswxjbrbaroacqk
VITE_SUPABASE_URL=https://yfthrzswxjbrbaroacqk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdGhyenN3eGpicmJhcm9hY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5OTk5OTksImV4cCI6MjAzMzU3NTk5OX0.dummy_key_aprimore
```

## Backend Java

Para rodar o backend Java:
1. Certifique-se de ter o JDK 17+ instalado.
2. Navegue até `backend-java`.
3. Execute: `mvn compile exec:java -Dexec.mainClass=escola.Main`

## Frontend (React/Vite)

Para rodar o frontend:
1. `bun install` ou `npm install`
2. `bun dev` ou `npm run dev`

As IAs estão configuradas com fallbacks internos, então mesmo sem o arquivo .env o chat deve funcionar.
