# Aprimore Educação

Plataforma web de apoio à aprendizagem, com foco em acessibilidade, organização dos estudos e comunicação clara entre estudantes e educadores.

## Stack

- Java 25
- Jakarta Servlet 6.1
- JDBC e MySQL 8+
- HTML5, CSS3 e JavaScript puro
- Maven para testes, compilação e empacotamento WAR

## Estrutura do projeto

```text
backend/
  src/main/java/       Servlets, serviços, modelos, segurança e acesso a dados
  src/test/java/       Testes automatizados
  pom.xml              Dependências e build WAR
frontend/
  index.html            Página inicial e autenticação
  dashboard.html        Painel autenticado
  assets/css/           Estilos responsivos
  assets/js/            Comportamento da interface
banco-de-dados/
  schema.sql            Estrutura MySQL
  usuario-aplicacao.sql Exemplo de usuário com privilégios mínimos
.github/workflows/      Build e validações automáticas
.env.example            Nomes das variáveis de ambiente
```

## Funcionalidades implementadas

- Cadastro público de contas de estudante; o perfil não pode ser escolhido pelo formulário.
- Login e logout com sessão HTTP, expiração, renovação do identificador da sessão e senha protegida com BCrypt.
- Filtro CSRF para operações autenticadas e cabeçalhos de segurança HTTP.
- Criação e consulta de turmas com permissões por perfil.
- Cadastro de alunos e vínculo opcional com uma conta de estudante.
- Publicação e consulta de atividades, com envio de respostas por estudantes vinculados a uma turma.
- Correção de entregas com nota de 0 a 10 e feedback, limitada às turmas do professor.
- Registro de frequência por turma, com histórico e validação de permissão do professor.
- Caixa de mensagens autenticada, contatos limitados por perfil e marcação automática de mensagens recebidas como lidas.
- Resumo de indicadores da plataforma disponível somente para administradores e CEO.
- Check-in pessoal de bem-estar com histórico restrito ao próprio estudante.
- Tutor pedagógico opcional por API, com chave mantida somente no servidor.
- Layout responsivo e formulários acessíveis com mensagens de estado.

Os módulos de recuperação de senha, relatórios administrativos completos e demais rotinas escolares ainda não fazem parte desta versão funcional. Não são apresentados como concluídos.

## Requisitos

- JDK 25
- Maven 3.9+
- MySQL 8+
- Servidor compatível com Jakarta Servlet 6.1

## Configurar o banco de dados

1. Execute `banco-de-dados/schema.sql` em uma instância MySQL 8+.
2. Crie uma conta de aplicação com privilégios mínimos. Revise o host permitido no script `banco-de-dados/usuario-aplicacao.sql` para o ambiente de implantação.
3. Configure as variáveis de ambiente no sistema operacional, IDE ou servidor:

```bash
DB_URL=jdbc:mysql://localhost:3306/aprimore
DB_USER=aprimore_app
DB_PASSWORD=sua_senha_local
SESSION_COOKIE_SECURE=false
```

O Java não carrega arquivos `.env` automaticamente. O valor `SESSION_COOKIE_SECURE=false` serve somente para desenvolvimento local por HTTP. Em produção, use HTTPS e `SESSION_COOKIE_SECURE=true`. Nunca salve senhas reais no repositório.

O cadastro público cria somente usuários com perfil `ALUNO`. Para criar contas de equipe, crie a conta normalmente e altere seu perfil somente por um procedimento administrativo confiável no banco. Exemplo:

```sql
UPDATE usuarios SET perfil = 'PROFESSOR'
WHERE email = 'professor@exemplo.com' AND status = 'ATIVO';
```

Use `ADMIN` ou `CEO` somente para contas confiáveis com autorização explícita. Não exponha uma rota pública para promover perfis.

## Compilar e executar

Na raiz do repositório:

```bash
cd backend
mvn --batch-mode clean verify
```

O WAR é gerado em `backend/target/aprimore.war`. O Maven inclui os arquivos estáticos da pasta `frontend/` dentro do WAR, de modo que a interface e a API possam ser servidas pelo mesmo contexto. Implante o arquivo em um contêiner compatível com Servlet 6.1 e configure as variáveis de ambiente antes de iniciar o servidor.

Para testar a compilação e os testes unitários, é necessário JDK 25 e acesso ao Maven Central. Para testar as funcionalidades, também é necessário MySQL configurado e o WAR implantado. O tutor precisa, adicionalmente, de uma chave de API válida.

## API

| Método | Rota | Acesso |
|---|---|---|
| POST | `/api/auth/cadastro` | Público; cria perfil de estudante |
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Sessão autenticada |
| POST | `/api/auth/logout` | Sessão autenticada + CSRF |
| GET / POST | `/api/turmas` | Professor, administrador ou CEO |
| GET / POST | `/api/alunos` | Consulta conforme perfil; cadastro pela equipe autorizada |
| GET / POST | `/api/atividades` | Consulta conforme perfil; publicação pela equipe autorizada |
| GET / POST | `/api/submissoes` | Consulta conforme perfil; envio pelo estudante |
| GET / POST | `/api/correcoes` | Professor nas próprias turmas; administrador ou CEO |
| GET / POST | `/api/frequencia` | Consulta conforme perfil; registro pela equipe pedagógica |
| GET | `/api/contatos` | Sessão autenticada; contatos filtrados por perfil |
| GET / POST | `/api/mensagens` | Sessão autenticada; somente mensagens enviadas ou recebidas pela conta |
| GET | `/api/relatorios/resumo` | Somente administrador ou CEO |
| GET / POST | `/api/sentimentos` | Somente o estudante autenticado e vinculado ao perfil escolar |
| POST | `/api/ia/tutor` | Usuário autenticado; requer configuração do provedor |

As operações de escrita autenticadas exigem o token CSRF emitido pelo endpoint `/api/auth/me`. Todas as autorizações devem ser mantidas no servidor; esconder controles na interface não substitui a verificação de permissões.

## Tutor pedagógico

Configure opcionalmente:

```bash
AI_API_KEY=sua_chave
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

A chave fica no ambiente do servidor e nunca deve ser enviada ao navegador. Sem chave configurada, o endpoint retorna uma mensagem de serviço indisponível.

## Verificações automáticas

O GitHub Actions compila e executa os testes com JDK 25 e valida a sintaxe dos arquivos JavaScript. A aprovação do pipeline não substitui testes de ponta a ponta com MySQL, servidor Servlet e configuração real do tutor.
