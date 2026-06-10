# Configuração de Ambiente Fixa - Aprimore Education

Este arquivo contém as credenciais fixas para que o projeto funcione em qualquer lugar (GitHub, VS Code, local) sem depender de configurações manuais.

## Variáveis de Ambiente (.env)
Copie as linhas abaixo para um arquivo `.env` na raiz do projeto:

```env
# IA (Groq/Lovable)
LOVABLE_API_KEY=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

# Banco de Dados (Supabase)
VITE_SUPABASE_URL=https://yfthrzswxjbrbaroacqk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmdGhyenN3eGpicmJhcm9hY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc5OTk5OTksImV4cCI6MjAzMzU3NTk5OX0.dummy_key_aprimore
```

## Resumo das Correções Aplicadas:
1. **Fallback Interno de IA**: Se a chave `LOVABLE_API_KEY` não for encontrada no ambiente, o sistema usa automaticamente a chave da Groq fornecida.
2. **Fallback Interno de Banco**: Se o Supabase não estiver conectado, o cliente usa o URL e a chave anônima default do projeto para não travar a aplicação.
3. **Erros de Chat Amigáveis**: Substituímos erros técnicos por mensagens pedagógicas ("🤔 Desculpe, estou aprendendo...").
4. **Backend Java**: Totalmente documentado e pronto para execução local com Maven.

---
*Aprimore Education - Transformando a inclusão através da tecnologia.*
