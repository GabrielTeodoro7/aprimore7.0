# Relatório de Segurança - Aprimore Educação

## Auditoria de Segurança e Privacidade

O sistema segue as diretrizes da LGPD e as melhores práticas de segurança para dados educacionais sensíveis.

### Implementações de Segurança

1.  **Row Level Security (RLS):** Garantia de que cada escola só acessa seus próprios dados.
2.  **JWT & Refresh Token:** Ciclo de autenticação seguro com rotação de tokens.
3.  **Sanitização de Dados:** Proteção contra SQL Injection e XSS via bibliotecas de validação (Zod/TanStack).
4.  **Política de Senhas:** Validação visual e checklist em tempo real para senhas fortes.

### Conformidade LGPD

- Logs de auditoria para toda alteração sensível.
- Relatório de Impacto à Proteção de Dados (RIPD) mapeado nos fluxos.
- Botão de exportação de dados (Direito ao esquecimento/Portabilidade).
