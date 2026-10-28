# Aprimore Educação

Plataforma educacional com foco em acessibilidade, organização dos estudos e apoio a estudantes e educadores.

## Tecnologias da nova base

- **Java 25** e **Jakarta Servlet 6.1** no servidor.
- **JDBC e MySQL 8+** para persistência.
- **HTML5, CSS3 e JavaScript puro** na interface.
- **Maven** para dependências, testes e empacotamento WAR.

## Estrutura

```text
backend/                 Aplicação Java web e endpoints
frontend/                HTML, CSS e JavaScript sem frameworks
banco-de-dados/          Esquema MySQL e estrutura dos dados
.github/workflows/       Verificação automática de build e sintaxe
```

## Funcionalidades migradas nesta etapa

- Página inicial responsiva e formulário de acesso.
- Cadastro de conta com papel inicial restrito a aluno.
- Login e logout com sessão HTTP, expiração e proteção contra fixação de sessão.
- Senhas armazenadas com BCrypt; consultas JDBC parametrizadas.
- Token CSRF para operações autenticadas.
- Cadastro e consulta de turmas, alunos e atividades.
- Restrições por perfil nos endpoints de turmas, alunos e atividades.
- Painel com dados da conta e interface para gerenciamento básico de turmas, alunos e atividades.

**A migração completa ainda não terminou.** Painéis completos de aluno, professor, administrador e CEO, notas, avaliações, frequência, mensagens, rotina, sentimentos, conquistas, recursos de acessibilidade avançada e tutor pedagógico ainda precisam ser portados e validados. A implementação anterior permanece na branch como referência durante a migração; referências antigas só devem ser removidas depois de substituir os módulos dependentes.

## Requisitos

- JDK 25.
- Maven 3.9 ou superior.
- MySQL 8.0 ou superior.
- Contêiner Servlet compatível com Jakarta Servlet 6.1.

## Banco de dados

1. Execute `banco-de-dados/schema.sql` com uma conta administrativa do MySQL.
2. Crie um usuário de aplicação com permissões limitadas ao banco `aprimore` (sem espaço: `aprimore`).
3. Configure estas variáveis no ambiente do servidor:

```bash
DB_URL=jdbc:mysql://localhost:3306/aprimore
DB_USER=aprimore_app
DB_PASSWORD=sua_senha_local
SESSION_COOKIE_SECURE=true
```

Em desenvolvimento local sem HTTPS, defina `SESSION_COOKIE_SECURE=false`. **Nunca use essa configuração em produção.** O Java não carrega arquivos `.env` automaticamente; configure as variáveis no sistema operacional, IDE ou ambiente de hospedagem.

O cadastro público cria apenas usuários com perfil `ALUNO`. Para promover uma conta de confiança a administradora, depois de criá-la, execute manualmente no banco:

```sql
UPDATE usuarios SET perfil = 'ADMIN' WHERE email = 'seu-email@exemplo.com';
```

Para habilitar um professor, use o mesmo procedimento com `perfil = 'PROFESSOR'` e o e-mail da conta correspondente. Faça essas alterações somente com acesso administrativo confiável ao banco. Não use contas administrativas públicas nem deixe credenciais reais no repositório.

## Executar

Na pasta `backend/`, compile e empacote:

```bash
mvn clean verify
```

O WAR é gerado em `backend/target/aprimore.war`. Implante-o em um contêiner compatível com Servlet 6.1.

Sirva a pasta `frontend/` por um servidor HTTP e configure o mesmo domínio/reverse proxy para encaminhar `/api/` ao backend Java. Um servidor de arquivos estáticos sozinho não executa os servlets.

## API disponível nesta etapa

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/cadastro` | Público; cria perfil de aluno |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Sessão autenticada |
| POST | `/api/auth/logout` | Sessão autenticada |
| GET / POST | `/api/turmas` | Professor, administrador ou CEO |
| GET / POST | `/api/alunos` | Consulta conforme perfil; cadastro por equipe autorizada |
| GET / POST | `/api/atividades` | Consulta conforme perfil; publicação por equipe autorizada |

As rotas de escrita exigem token CSRF, sessão válida e autorização por perfil. Antes de disponibilizar a plataforma, ainda devem ser concluídos testes de integração com MySQL, proteção de tentativas de login, recuperação de senha, trilha de auditoria completa e a migração dos módulos restantes.

## Verificação automatizada

O GitHub Actions executa `mvn clean verify` com JDK 25 e valida a sintaxe dos arquivos JavaScript. A aprovação do build não substitui testes de ponta a ponta, configuração do banco nem validação das permissões no ambiente de implantação.
