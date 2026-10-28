# Plano de evolução do Aprimore

Este plano organiza as melhorias por prioridade. Ele separa o que já existe do que precisa de implementação e validação, para que a documentação não prometa recursos que ainda não foram testados.

## Prioridade 0 — Garantir confiabilidade antes de ampliar

- [ ] Executar testes de ponta a ponta com MySQL 8+, servidor compatível com Jakarta Servlet 6.1 e configuração SMTP de teste.
- [ ] Cobrir autorização por perfil: ALUNO, PROFESSOR, ADMIN e CEO, incluindo tentativas de acessar dados de outra turma/conta.
- [ ] Testar CSRF, expiração de sessão, logout, recuperação de senha e tokens expirados/reutilizados.
- [ ] Conferir integridade de banco em entregas, notas, frequência e vínculos aluno/turma.
- [ ] Revisar logs para garantir que senhas, tokens, dados sensíveis e conteúdo privado não sejam registrados.
- [ ] Fazer um roteiro de teste manual por perfil e registrar evidências do resultado.
- [ ] Definir backup, restauração e política de retenção antes de produção.

## Prioridade 1 — Organização e manutenção

- [x] Mapa visual da arquitetura e explicação de responsabilidades por pasta.
- [x] README com links para os mapas e guias.
- [ ] Criar um catálogo de rotas com método HTTP, permissão, corpo esperado, códigos de resposta e exemplos.
- [ ] Padronizar respostas de erro da API e identificadores de correlação para diagnóstico.
- [ ] Extrair regras repetidas de validação para serviços compartilhados, sem criar abstrações desnecessárias.
- [ ] Definir convenção de nomes para variáveis, métodos, classes, IDs HTML e atributos de dados.
- [ ] Adicionar testes para regras de negócio e autorização além dos testes utilitários existentes.

## Prioridade 2 — Experiência de aprendizagem

- [ ] Persistir recordes e progresso dos jogos no servidor, associados à conta autenticada, em vez de manter tudo apenas no dispositivo.
- [ ] Criar histórico de partidas e painel de evolução sem transformar a pontuação em comparação injusta entre estudantes.
- [ ] Melhorar os estados vazios, carregamento, erro de rede e confirmação das ações.
- [ ] Garantir navegação completa por teclado, foco visível, rótulos acessíveis e testes com leitor de tela.
- [ ] Validar em telas pequenas e navegadores diferentes.
- [ ] Permitir preferências pedagógicas e atividades adaptadas com controle de acesso apropriado.

## Prioridade 3 — Ferramentas de professor e administração

- [ ] Exportação segura de relatórios para CSV, com controle de permissão e proteção contra fórmulas maliciosas em planilhas.
- [ ] Filtros por turma, período, matéria e situação em relatórios.
- [ ] Histórico de alterações administrativas com ator, ação, horário, resultado e identificador do registro, evitando conteúdo sensível.
- [ ] Notificações persistidas, com estados de lida/não lida, caso o produto precise de histórico entre dispositivos.
- [ ] Indicadores com definições documentadas para evitar médias ou percentuais ambíguos.

## Prioridade 4 — Operação e segurança

- [ ] Usar armazenamento compartilhado para limite de tentativas quando houver múltiplas instâncias.
- [ ] Configurar HTTPS, cookies seguros, proxy confiável, monitoramento e alertas no ambiente real.
- [ ] Implementar gestão de segredos fora do repositório e rotacionar credenciais.
- [ ] Definir limites de tamanho para requisições e anexos antes de suportar upload de arquivos.
- [ ] Revisar dependências e atualizar versões com testes de regressão.
- [ ] Automatizar análise de dependências e verificações de segurança no pipeline.
- [ ] Documentar implantação, migração de banco, rollback e recuperação de falhas.

## Critério de conclusão de uma melhoria

Uma melhoria só deve ser marcada como concluída quando:

1. O comportamento estiver implementado no código.
2. As permissões e os erros forem tratados no servidor.
3. Existirem testes apropriados para o risco da mudança.
4. O pipeline correspondente passar.
5. A documentação explicar como usar e quais limites ainda existem.

**Importante:** este documento é um plano, não uma declaração de que todos os itens estão implementados. Não habilite funcionalidades críticas em produção sem os testes e a configuração necessários.
