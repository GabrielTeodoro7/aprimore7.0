# Banco de dados

O projeto usa MySQL. Os scripts SQL desta pasta descrevem a estrutura inicial e um exemplo de usuário de aplicação.

## Arquivos

- `schema.sql`: cria o banco e as tabelas, relacionamentos, restrições e índices.
- `usuario-aplicacao.sql`: exemplo para configurar um usuário MySQL com privilégios limitados. Revise host, senha e permissões antes de executar.

## Antes de alterar uma tabela

1. Localize a tabela em `schema.sql`.
2. Procure no backend os DAOs, Servlets e serviços que usam suas colunas.
3. Verifique chaves estrangeiras, unicidade, índices e impacto nos dados existentes.
4. Prepare e teste uma migração em banco de desenvolvimento; não dependa apenas de editar o esquema inicial para atualizar bancos já instalados.
5. Rode testes integrados e documente a mudança.

## Segurança

- Nunca versione credenciais reais.
- Não use uma conta administrativa do MySQL na aplicação.
- Use consultas parametrizadas JDBC.
- Restrinja permissões ao necessário e planeje backup/restauração antes de produção.
