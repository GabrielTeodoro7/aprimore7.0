# Guia do Aprimore para quem está começando

Este documento explica como localizar cada parte do projeto, o papel de cada pasta e o caminho percorrido quando alguém usa a plataforma.

## 1. Antes de começar: como a aplicação funciona?

O projeto tem três partes principais:

1. **Frontend:** é o que a pessoa vê e usa no navegador. É feito com HTML, CSS e JavaScript.
2. **Backend:** é o programa Java que recebe pedidos, valida dados, verifica permissões e executa as regras.
3. **Banco de dados:** é onde as informações ficam guardadas, usando MySQL.

Exemplo: quando um estudante entra na plataforma, o formulário HTML coleta e-mail e senha. O JavaScript envia os dados para uma rota do backend. O Servlet valida a requisição e consulta o banco por meio do JDBC. Se os dados estiverem corretos, o servidor cria a sessão e devolve uma resposta. O navegador então atualiza a interface.

## 2. Onde encontro cada coisa?

### Quero mudar uma página ou um formulário

Comece pela pasta `frontend/`.

- `index.html`: página de entrada e autenticação.
- `dashboard.html`: estrutura do painel autenticado.
- `assets/css/`: aparência, espaçamentos, cores e adaptação para telas menores.
- `assets/js/`: ações dos botões, validações da interface e chamadas para a API.

**HTML** define os elementos da página; **CSS** define a aparência; **JavaScript** reage às ações da pessoa e conversa com o backend. Não coloque senhas de banco ou chaves secretas nos arquivos do frontend, porque qualquer pessoa pode inspecioná-los pelo navegador.

### Quero mudar uma regra ou o comportamento do sistema

Comece por `backend/src/main/java/br/com/aprimore/`.

- `servlet/`: recebe requisições HTTP. Cada Servlet costuma cuidar de um grupo de rotas, como autenticação, turmas ou atividades.
- `service/`: concentra tarefas que podem ser reutilizadas, como enviar e-mails ou validar regras comuns.
- `dao/`: executa consultas e alterações no banco de dados. DAO significa *Data Access Object*, isto é, objeto de acesso a dados.
- `model/`: representa dados usados pela aplicação, como um usuário.
- `config/`: configurações compartilhadas, por exemplo, a conexão com o banco.
- `security/`: filtros e verificações que protegem requisições e sessões, incluindo o limite de tentativas de autenticação.

Um caminho comum é: **Servlet recebe → validação/serviço aplica a regra → DAO consulta ou grava → Servlet devolve a resposta**. Nem toda operação precisa usar todas essas camadas, mas manter essa separação ajuda a localizar os problemas.

### Quero alterar tabelas, colunas ou relacionamentos

Abra `banco-de-dados/schema.sql`.

Esse arquivo descreve a estrutura do banco: tabelas, colunas, chaves e relacionamentos. Antes de alterar uma tabela, confira também quais classes Java e rotas usam os campos envolvidos. Uma mudança somente no SQL pode quebrar o código que depende daquela coluna.

O arquivo `usuario-aplicacao.sql` é um exemplo para criar um usuário de banco com privilégios limitados. Ajuste o host e a senha para seu ambiente; não use credenciais de exemplo em produção.

### Quero entender as bibliotecas e compilar o projeto

Abra `backend/pom.xml`.

O Maven lê esse arquivo para saber a versão do Java, quais bibliotecas são necessárias, como executar os testes e como gerar o WAR. Evite adicionar novas dependências sem necessidade: a regra deste projeto é manter Java 25, Jakarta Servlet 6.1, MySQL/JDBC, HTML, CSS, JavaScript puro e Maven.

### Quero saber se uma alteração passou nas verificações

Veja `.github/workflows/java.yml` e a aba **Actions** do GitHub. O workflow automatiza verificações como compilação, testes unitários e sintaxe JavaScript. Uma aprovação não substitui a execução do sistema com MySQL e servidor configurados.

## 3. Funcionalidades de segurança adicionadas

O filtro `LimiteTentativasFilter` limita o login a 10 tentativas por IP e a recuperação de senha a 5 tentativas por IP dentro de uma janela de 15 minutos. Ele responde com HTTP 429 quando o limite é excedido. É uma proteção básica mantida na memória do processo; para implantação com várias instâncias, substitua-a por um controle compartilhado e configure corretamente o endereço real do cliente atrás de um proxy.

O login também atualiza a coluna `ultimo_acesso` da tabela `usuarios`. A busca de atividades no painel filtra os cartões já carregados pelo título, matéria, turma e descrição, sem enviar novas consultas ao servidor.

### Recursos de aprendizagem disponíveis

A aba **Jogos educativos** contém 18 jogos executáveis, sem depender de links externos: Desafio das Operações, Mestre da Gramática, Célula Interativa, Labirinto de Lógica, Explorador Global, Estúdio Criativo, Ecossistema em Equilíbrio, Geometria Espacial, Linha do Tempo: Brasil, Vocabulário Ninja, Desafio Criativo, Ritmo & Melodia, Corrida das Letras, Memória Espacial, Matemática Ninja, Quebra-Cabeça Natural, Palavra Embaralhada e Quiz Relâmpago. Cada jogo tem regras próprias, respostas ou interações, pontuação e opção de jogar novamente. Os recordes ficam no armazenamento local do navegador, não em uma classificação compartilhada entre estudantes.

O **Calendário** usa as datas de entrega das atividades disponíveis para a conta. Os botões de mês anterior e próximo mudam o calendário, e selecionar um dia mostra os prazos daquele dia. A **Central de notificações** reúne prazos dos próximos sete dias, mensagens não lidas e entregas aguardando correção; use Atualizar para buscar os dados novamente. Essas notificações são calculadas a partir dos dados atuais e ainda não são notificações push nem e-mails automáticos.

Em **Acessibilidade**, a pessoa pode aumentar ou diminuir o texto, ativar alto contraste e reduzir movimentos. As preferências são salvas no navegador quando o armazenamento está disponível.

Os relatórios administrativos exibem os indicadores gerais e uma visão por turma com alunos ativos, atividades publicadas, entregas, média das notas e frequência registrada. O **Histórico de alterações** fica disponível para ADMIN e CEO. Ele registra operações autenticadas de escrita que terminam com resposta bem-sucedida, sem armazenar senhas ou conteúdo de mensagens. O IP registrado é o endereço observado pelo servidor; em ambientes com proxy, a infraestrutura precisa ser configurada corretamente.

## 4. Vocabulário rápido

- **Frontend:** parte da aplicação que roda no navegador.
- **Backend:** parte que roda no servidor e protege as regras e os dados.
- **API:** conjunto de rotas pelas quais o frontend conversa com o backend.
- **Rota/endpoint:** endereço da API usado para uma operação, como `/api/auth/login`.
- **Servlet:** classe Java que recebe requisições HTTP.
- **JDBC:** ferramenta Java para conversar com bancos relacionais.
- **DAO:** classe responsável por buscar e gravar dados.
- **SQL:** linguagem usada para consultar e modificar dados do banco.
- **Sessão:** mecanismo que permite ao servidor reconhecer uma pessoa autenticada entre requisições.
- **CSRF:** tipo de ataque em que um site tenta induzir o navegador a enviar uma operação sem a intenção da pessoa; o token CSRF ajuda a impedir isso.
- **Hash de senha:** representação calculada da senha usada para verificar a senha sem guardar o texto original.
- **Maven:** ferramenta que organiza bibliotecas, compilação, testes e empacotamento.
- **WAR:** arquivo que empacota uma aplicação web Java para ser implantada em um servidor compatível.
- **Teste unitário:** verifica uma parte pequena do código isoladamente.
- **Teste de integração:** verifica se partes reais, como Java e MySQL, funcionam juntas.

## 5. Como investigar um erro sem se perder

1. **Reproduza o erro:** anote a página, o botão, os dados usados e a mensagem recebida.
2. **Abra as ferramentas do navegador:** confira a aba Console para erros JavaScript e Network/Rede para ver a requisição HTTP, o status e a resposta da API.
3. **Localize a rota:** procure o caminho, por exemplo `/api/auth/login`, nos arquivos de `backend/src/main/java/.../servlet/`.
4. **Siga os dados:** veja qual validação ou serviço é chamado e qual DAO consulta o banco.
5. **Confira o banco:** verifique se a tabela e as colunas existem e se a consulta corresponde ao schema atual.
6. **Leia a mensagem do servidor:** use os logs do servidor; não exponha senhas, tokens ou dados pessoais ao compartilhar logs.
7. **Rode as verificações:** na pasta `backend/`, execute `mvn clean verify`.
8. **Teste o fluxo completo:** confirme o comportamento no navegador com um banco de desenvolvimento, não apenas a compilação.

Evite corrigir um erro apenas escondendo a mensagem na tela. Descubra em qual camada ele ocorre e corrija a causa.

## 6. Como escrever código fácil de manter

- Use nomes que expliquem a intenção e mantenha um padrão de nomenclatura.
- Deixe comentários para explicar **por que** uma decisão existe ou uma regra não é óbvia. Evite comentários que apenas repetem cada linha.
- Faça cada método cuidar de uma tarefa clara.
- Use consultas SQL parametrizadas com `PreparedStatement`; não monte SQL concatenando dados digitados por usuários.
- Valide os dados no servidor, mesmo quando já existe validação no navegador.
- Confira a autorização em cada operação que lê ou altera dados privados.
- Não registre senhas, tokens de recuperação, cookies ou chaves em logs.
- Ao mudar o schema, atualize o código dependente e documente a mudança.
- Crie testes para comportamentos importantes e também para entradas inválidas e acessos negados.
- Prefira mudanças pequenas que possam ser revisadas e testadas separadamente.

Os comentários e esta documentação devem ajudar você a aprender e manter o sistema; eles não substituem entender o código e testar as alterações.

## 7. Próximas melhorias recomendadas

As funcionalidades abaixo ainda são boas candidatas para uma próxima etapa, mas não devem ser tratadas como concluídas:

### Prioridade 1 — validar e fortalecer o sistema

1. **Testes de integração e ponta a ponta:** executar os fluxos com MySQL real e servidor Servlet 6.1, inclusive falhas de conexão e permissões negadas.
2. **Limite de tentativas compartilhado:** substituir o contador em memória por controle compartilhado para instalações com múltiplas instâncias.
3. **Testes de autorização por perfil:** provar que estudantes não acessam dados de outros estudantes e que professores não alteram turmas alheias.
4. **Configuração de proxy e HTTPS:** testar cookies seguros, endereço real do cliente e cabeçalhos em implantação.
5. **Auditoria mais detalhada:** registrar identificadores das entidades alteradas quando as rotas fornecerem esses dados, além de definir retenção e exportação segura dos registros.

### Prioridade 2 — funcionalidades escolares

6. **Notificações configuráveis:** permitir que cada perfil escolha quais avisos deseja receber, com opção de e-mail quando o SMTP estiver configurado.
7. **Anexos de atividades:** aceitar arquivos com limite de tamanho, validação de tipo, armazenamento seguro e autorização por turma.
8. **Exportação CSV:** disponibilizar relatórios para pessoas autorizadas, sem incluir dados desnecessários.
9. **Gamificação persistente:** guardar pontuações e conquistas no servidor e criar rankings reais por turma, em vez de depender somente do navegador.
10. **Gestão de avaliações e calendário completo:** incluir avaliações, eventos escolares e prazos além das atividades já cadastradas.

### Prioridade 3 — qualidade e acessibilidade

11. **Testes de usabilidade:** validar os fluxos com estudantes e professores em celulares, tablets e computadores.
12. **Auditoria de acessibilidade:** testar teclado, leitores de tela, contraste, foco e conteúdo ampliado.
13. **Observabilidade:** centralizar logs técnicos, alertas de falhas e indicadores de disponibilidade sem registrar segredos.
14. **Tutor pedagógico responsável:** estabelecer limites de uso, proteção de dados e orientação para não enviar informações pessoais de estudantes a provedores externos.

## 8. Ordem recomendada de trabalho

1. Confirmar compilação e testes unitários.
2. Executar a aplicação em ambiente de desenvolvimento com MySQL.
3. Testar cadastro, login, recuperação de senha e encerramento de sessão.
4. Testar turmas, atividades, entregas, correções e frequência com perfis diferentes.
5. Testar mensagens, bem-estar e permissões administrativas.
6. Corrigir problemas encontrados antes de adicionar novas funcionalidades.
7. Só depois priorizar as melhorias de calendário, notificações e relatórios.

**Regra principal:** uma funcionalidade só deve ser descrita como concluída depois de seu fluxo real ter sido testado, inclusive em casos de erro e falta de permissão.
