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
- `security/`: filtros e verificações que protegem requisições e sessões.

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

## 3. Vocabulário rápido

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

## 4. Como investigar um erro sem se perder

1. **Reproduza o erro:** anote a página, o botão, os dados usados e a mensagem recebida.
2. **Abra as ferramentas do navegador:** confira a aba Console para erros JavaScript e Network/Rede para ver a requisição HTTP, o status e a resposta da API.
3. **Localize a rota:** procure o caminho, por exemplo `/api/auth/login`, nos arquivos de `backend/src/main/java/.../servlet/`.
4. **Siga os dados:** veja qual validação ou serviço é chamado e qual DAO consulta o banco.
5. **Confira o banco:** verifique se a tabela e as colunas existem e se a consulta corresponde ao schema atual.
6. **Leia a mensagem do servidor:** use os logs do servidor; não exponha senhas, tokens ou dados pessoais ao compartilhar logs.
7. **Rode as verificações:** na pasta `backend/`, execute `mvn clean verify`.
8. **Teste o fluxo completo:** confirme o comportamento no navegador com um banco de desenvolvimento, não apenas a compilação.

Evite corrigir um erro apenas escondendo a mensagem na tela. Descubra em qual camada ele ocorre e corrija a causa.

## 5. Como escrever código fácil de manter

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

## 6. Ideias para evoluir o Aprimore

As ideias abaixo são sugestões, não funcionalidades que já estejam prontas.

### Prioridade 1 — confiabilidade e segurança

1. **Testes de integração:** automatizar fluxos com MySQL e servidor Servlet configurados.
2. **Limite de tentativas:** controlar tentativas de login e recuperação de senha para dificultar ataques automatizados.
3. **Testes de permissões:** garantir que um estudante não veja dados de outro e que um professor só altere informações das próprias turmas.
4. **Validação de implantação:** documentar o servidor Servlet compatível, as variáveis necessárias e um roteiro de verificação pós-instalação.
5. **Registro seguro de erros:** registrar informações úteis para diagnóstico sem guardar dados secretos.

### Prioridade 2 — ferramentas para estudantes e professores

6. **Calendário escolar:** datas de atividades, avaliações e prazos.
7. **Notificações:** avisar sobre atividade publicada, prazo próximo, correção liberada ou mensagem recebida.
8. **Relatórios completos:** frequência, entregas pendentes, notas e evolução por turma, com acesso restrito por perfil.
9. **Filtros e pesquisa:** localizar turmas, estudantes e atividades sem percorrer listas grandes.
10. **Anexos de atividades:** permitir arquivos com limite de tamanho e validação de tipo, armazenados com controle de acesso.
11. **Histórico de alterações:** registrar quem alterou notas, frequência ou atividades, quando e qual foi a alteração.
12. **Exportação de relatórios:** gerar CSV para uso autorizado pela equipe escolar.

### Prioridade 3 — experiência e acessibilidade

13. **Acessibilidade:** testar navegação por teclado, foco visível, contraste, rótulos de formulário e leitores de tela.
14. **Mensagens de erro úteis:** explicar como corrigir um campo sem expor detalhes internos do servidor.
15. **Layout adaptável:** validar páginas em celulares, tablets e computadores.
16. **Preferências de notificação:** permitir que cada pessoa escolha quais avisos deseja receber.
17. **Ajuda dentro do sistema:** incluir explicações curtas e exemplos nos pontos em que usuários iniciantes costumam ter dúvidas.

### Prioridade 4 — tutor pedagógico responsável

18. **Limites de uso:** definir limites de solicitações e custos para o serviço externo.
19. **Proteção de dados:** evitar enviar dados pessoais de estudantes ao provedor e documentar o que é compartilhado.
20. **Orientação, não substituição:** apresentar o tutor como apoio ao estudo, incentivar o raciocínio do estudante e permitir que professores acompanhem seu uso conforme as regras da instituição.

## 7. Ordem recomendada de trabalho

1. Confirmar compilação e testes unitários.
2. Executar a aplicação em ambiente de desenvolvimento com MySQL.
3. Testar cadastro, login, recuperação de senha e encerramento de sessão.
4. Testar turmas, atividades, entregas, correções e frequência com perfis diferentes.
5. Testar mensagens, bem-estar e permissões administrativas.
6. Corrigir problemas encontrados antes de adicionar novas funcionalidades.
7. Só depois priorizar as melhorias de calendário, notificações e relatórios.

**Regra principal:** uma funcionalidade só deve ser descrita como concluída depois de seu fluxo real ter sido testado, inclusive em casos de erro e falta de permissão.
