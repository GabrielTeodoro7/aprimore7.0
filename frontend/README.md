# Frontend

Esta pasta contém os arquivos enviados ao navegador. A interface é feita com HTML5, CSS3 e JavaScript puro, sem framework de interface.

## Mapa rápido

- `index.html`: login, cadastro e recuperação de acesso.
- `dashboard.html`: estrutura do painel autenticado.
- `assets/css/style.css`: estilos, layout, responsividade e estados visuais.
- `assets/js/app.js`: comportamento da página de autenticação.
- `assets/js/dashboard.js`: carregamento de dados e ações do painel.
- `assets/js/jogos.js`: catálogo, regras e pontuação dos jogos.
- `assets/js/recursos.js`: calendário, avisos e preferências de acessibilidade.

## Fluxo de uma ação

1. HTML fornece a estrutura e os campos.
2. JavaScript reage ao evento, valida o básico no navegador e envia a requisição.
3. O servidor Java valida os dados e as permissões de verdade.
4. JavaScript apresenta a resposta ou a mensagem de erro.

A validação no navegador melhora a experiência, mas nunca substitui a validação no servidor.

## Cuidados

- Não inclua senhas de banco, tokens secretos ou chaves privadas nestes arquivos.
- Use mensagens de erro claras e estados de carregamento.
- Crie elementos dinâmicos com APIs seguras do DOM; evite inserir conteúdo do usuário como HTML sem sanitização.
- Ao criar uma nova página, mantenha navegação por teclado, rótulos de formulário e foco visível.
- Jogos e recordes atualmente podem manter pontuação no dispositivo; não trate isso como ranking oficial da conta.
