# Aprimore Educação

Plataforma web de apoio à aprendizagem, criada para aproximar estudantes e educadores e facilitar a organização das atividades escolares.

> **Situação atual:** a migração para a stack Java está na branch `refactor/java25-servlet61-migration`. A compilação e os testes automatizados passaram no último pipeline, mas o sistema ainda precisa de testes integrados com banco de dados e servidor antes de ser considerado pronto para produção.

## Tecnologias utilizadas

- **Java 25:** regras e processamento no servidor.
- **Jakarta Servlet 6.1:** recebe as requisições HTTP e encaminha cada operação.
- **JDBC + MySQL 8+:** comunicação com o banco de dados.
- **HTML5, CSS3 e JavaScript puro:** páginas, aparência e interações do navegador.
- **Maven:** organiza as dependências, executa os testes e gera o arquivo WAR.
- **JUnit:** testes automatizados do código Java.

Não usamos React, TypeScript, Vite ou frameworks de interface neste frontend. As bibliotecas Java declaradas no Maven são dependências do backend, não novas linguagens de programação.

## Pastas do projeto

```text
aprimore7.0/
├── backend/                 Código Java, testes e configuração do Maven
│   ├── src/main/java/       Código principal do servidor
│   │   └── br/com/aprimore/
│   │       ├── config/      Configurações, como conexão com o banco
│   │       ├── dao/         Consultas e gravações no banco de dados
│   │       ├── model/       Classes que representam os dados
│   │       ├── security/    Proteções de requisições e sessões
│   │       ├── service/     Serviços reutilizáveis, como envio de e-mail
│   │       └── servlet/     Endpoints HTTP da aplicação
│   ├── src/test/java/       Testes automatizados
│   └── pom.xml              Tecnologias, dependências e regras de compilação
├── frontend/                Arquivos exibidos no navegador
│   ├── index.html           Entrada e autenticação
│   ├── dashboard.html       Painel da plataforma
│   └── assets/
│       ├── css/             Cores, layout e responsividade
│       └── js/              Eventos, formulários e chamadas à API
├── banco-de-dados/          Scripts SQL do MySQL
│   ├── schema.sql           Criação das tabelas
│   └── usuario-aplicacao.sql Exemplo de usuário com privilégios limitados
├── documentacao/             Guias para entender e manter o sistema
├── .github/workflows/        Verificações automáticas do repositório
├── .env.example              Exemplo dos nomes das configurações necessárias
├── .gitignore                Arquivos que não devem ser versionados
└── README.md                 Visão geral e instruções rápidas
```

Para uma explicação passo a passo, consulte **[Guia do projeto para iniciantes](documentacao/GUIA_DO_PROJETO.md)**.

## Funcionalidades presentes nesta versão

- Cadastro de estudantes, login, logout e recuperação de senha por e-mail.
- Senhas armazenadas com hash BCrypt, sessões HTTP e limite básico de tentativas por endereço IP em cadastro, login e recuperação de senha. O limite é local ao processo e deve ser complementado por proteção na infraestrutura em ambientes distribuídos.
- Proteção CSRF nas operações autenticadas e cabeçalhos de segurança.
- Turmas, cadastro de alunos e vínculo opcional entre aluno e conta.
- Publicação de atividades, envio de respostas, correções, notas e feedback. Estudantes podem consultar seu histórico de entregas, notas e comentários; o servidor bloqueia novo envio após a correção.
- Registro e consulta de frequência conforme permissões.
- Contatos e mensagens entre contas autorizadas.
- Resumo de indicadores para administradores e CEO.
- Registro pessoal de bem-estar do estudante.
- Tutor pedagógico opcional por API, configurado no servidor.
- Interface responsiva e mensagens de retorno nos formulários.

### O que ainda precisa ser validado ou desenvolvido

- Testes de ponta a ponta com MySQL real e aplicação implantada em um servidor compatível com Servlet 6.1.
- Teste real do envio e do consumo de token de recuperação de senha por SMTP.
- Testes de autorização para todos os perfis e operações, inclusive casos de acesso indevido.
- Evoluir o limite de tentativas para armazenamento compartilhado entre instâncias e configurar corretamente IPs de proxy reverso, quando houver.
- Monitoramento, políticas de retenção e testes de acessibilidade.
- Relatórios administrativos detalhados e outras rotinas escolares ainda não implementadas.
- Testes de acessibilidade e navegação em diferentes dispositivos e navegadores.

Por isso, **não considere a aplicação pronta para produção apenas porque a compilação passou**.

## Requisitos para executar

- JDK 25
- Maven 3.9 ou superior
- MySQL 8 ou superior
- Servidor compatível com Jakarta Servlet 6.1
- Configurações de ambiente descritas abaixo

## Configurar o banco de dados

1. Inicie o MySQL.
2. Execute o script `banco-de-dados/schema.sql` para criar a estrutura.
3. Configure um usuário de aplicação com privilégios mínimos, usando `banco-de-dados/usuario-aplicacao.sql` como exemplo. Ajuste o host de acordo com seu ambiente.
4. Defina as variáveis de ambiente antes de iniciar o servidor:

```bash
DB_URL=jdbc:mysql://localhost:3306/aprimore
DB_USER=aprimore_app
DB_PASSWORD=sua_senha_local
SESSION_COOKIE_SECURE=false
```

O Java não carrega automaticamente o arquivo `.env.example`: ele é um modelo para copiar as variáveis para a configuração da sua IDE ou do servidor. O valor `SESSION_COOKIE_SECURE=false` é somente para desenvolvimento local por HTTP. Em produção, configure HTTPS e use `SESSION_COOKIE_SECURE=true`.

**Nunca coloque senhas reais, tokens ou chaves de API no GitHub.**

O cadastro público cria somente contas de estudante. Perfis como `PROFESSOR`, `ADMIN` e `CEO` devem ser concedidos por um procedimento administrativo confiável; não crie uma rota pública para promover usuários.

## Compilar e executar

Na pasta raiz do repositório, execute:

```bash
cd backend
mvn clean verify
```

O comando compila o backend, executa os testes automatizados e gera `backend/target/aprimore.war`. O Maven inclui os arquivos da pasta `frontend/` no WAR para que a interface e a API sejam servidas pelo mesmo contexto.

Depois, implante o WAR em um servidor compatível com Servlet 6.1 e configure as variáveis de ambiente nesse servidor. A compilação, sozinha, não configura o MySQL nem inicia a aplicação.

### Recuperação de senha por e-mail

Configure as variáveis SMTP descritas em `.env.example`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM`. O fluxo usa token temporário de uso único com expiração de 15 minutos. O envio real precisa ser testado com uma conta SMTP válida.

### Limite de tentativas de autenticação

O servidor limita tentativas a 10 solicitações de login e 5 solicitações de recuperação de senha por endereço IP, em janelas de 15 minutos. Esse controle é mantido na memória do processo: reiniciar a aplicação limpa os contadores e múltiplas instâncias não compartilham os limites. Em produção com várias instâncias, use um mecanismo compartilhado e revise a configuração de proxy para não agrupar todos os usuários no mesmo endereço.

## Tutor pedagógico opcional

Configure no servidor:

```bash
AI_API_KEY=sua_chave
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

A chave não pode ser exposta ao JavaScript do navegador. Sem uma chave válida, o serviço do tutor não estará disponível.

## Rotas principais da API

| Método | Rota | Finalidade |
|---|---|---|
| POST | `/api/auth/cadastro` | Criar conta de estudante |
| POST | `/api/auth/login` | Entrar na plataforma |
| POST | `/api/auth/logout` | Encerrar a sessão |
| POST | `/api/auth/recuperacao` | Solicitar recuperação de senha |
| POST | `/api/auth/redefinir-senha` | Definir nova senha com token válido |
| GET | `/api/auth/me` | Consultar a conta e os dados da sessão |
| GET / POST | `/api/turmas` | Consultar ou criar turmas conforme o perfil |
| GET / POST | `/api/alunos` | Consultar ou cadastrar alunos conforme a permissão |
| GET / POST | `/api/atividades` | Consultar ou publicar atividades |
| GET / POST | `/api/submissoes` | Consultar ou enviar respostas |
| GET / POST | `/api/correcoes` | Consultar ou registrar correções e notas |
| GET / POST | `/api/frequencia` | Consultar ou registrar frequência |
| GET | `/api/contatos` | Listar contatos permitidos |
| GET / POST | `/api/mensagens` | Consultar ou enviar mensagens |
| GET | `/api/relatorios/resumo` | Consultar indicadores administrativos |
| GET / POST | `/api/sentimentos` | Registrar ou consultar o próprio histórico de bem-estar |
| POST | `/api/ia/tutor` | Enviar pergunta ao tutor opcional |

As operações autenticadas de escrita exigem o token CSRF obtido em `/api/auth/me`. A autorização é sempre responsabilidade do servidor; esconder um botão na página não é uma proteção de segurança.

## Testes automáticos

O workflow do GitHub Actions compila o projeto com JDK 25, executa os testes unitários e verifica a sintaxe dos arquivos JavaScript. Consulte a aba **Actions** para ver o resultado mais recente.

Um pipeline aprovado confirma somente as etapas que ele executa. Os testes reais de banco, implantação, e-mail e fluxos completos ainda precisam ser realizados.
