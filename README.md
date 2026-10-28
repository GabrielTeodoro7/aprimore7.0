# Aprimore Educação

Plataforma educacional com foco em acessibilidade, organização dos estudos e apoio a estudantes e educadores.

## Tecnologias da nova base

- **Java 25** para o servidor.
- **Jakarta Servlet 6.1** para endpoints HTTP.
- **JDBC e MySQL 8+** para persistência.
- **HTML5, CSS3 e JavaScript puro** para a interface.
- **Maven** para dependências, testes e empacotamento WAR.

## Estrutura

```text
backend/                 Aplicação Java web e endpoints
frontend/                HTML, CSS e JavaScript sem frameworks
banco-de-dados/          Esquema e scripts SQL
```

## Funcionalidades já iniciadas nesta base

- Página inicial responsiva com navegação por seções.
- Formulário de cadastro e login conectado aos endpoints HTTP.
- Validação inicial de campos no servidor.
- Hash de senha com BCrypt e consultas JDBC parametrizadas.
- Sessão HTTP com expiração e cookie HttpOnly.

A migração dos módulos antigos ainda está em andamento. Recursos como perfis completos, painéis de aluno/professor/admin/CEO, acompanhamento pedagógico, acessibilidade avançada e ferramentas de apoio ao estudo precisam ser portados e testados antes de considerar a substituição concluída.

## Requisitos

- JDK 25.
- Maven 3.9 ou superior.
- MySQL 8.0 ou superior.
- Contêiner Servlet compatível com Jakarta Servlet 6.1.

## Configuração do banco

1. Crie um usuário próprio no MySQL, com permissões apenas sobre o banco `aprimore` (sem espaço: `aprimore`).
2. Execute `banco-de-dados/schema.sql`.
3. Configure as variáveis de ambiente no ambiente em que o servidor será executado:

```bash
DB_URL=jdbc:mysql://localhost:3306/aprimore
DB_USER=aprimore_app
DB_PASSWORD=defina_uma_senha_local
```

Use os valores sem espaços: o nome do banco padrão é `aprimore` (sem espaço, `aprimore`).

## Compilar e empacotar

Na pasta `backend/`:

```bash
mvn clean verify
```

O arquivo WAR é gerado em `backend/target/aprimore.war` (sem espaços no nome real: `aprimore.war`).

## Executar a interface

Sirva a pasta `frontend/` por um servidor HTTP. Para que os formulários funcionem, configure o servidor/reverse proxy para encaminhar `/api/` à aplicação Java no mesmo domínio. Não use um servidor estático isolado esperando que ele execute os servlets.

## Segurança e estado

- Não versionar arquivos `.env` nem credenciais.
- Usar HTTPS em produção.
- Aplicar controle de acesso por perfil em todos os endpoints protegidos antes de disponibilizar painéis.
- A autenticação é apenas a primeira etapa da migração; ainda é necessário completar proteção CSRF, limitação de tentativas e testes de integração.
- A compilação e os testes precisam ser executados em um ambiente com JDK 25, Maven e banco de dados disponíveis. Não há confirmação de execução completa nesta etapa.
