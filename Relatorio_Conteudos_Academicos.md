# Relatório — Conteúdos Acadêmicos no Backend Java

Este relatório mapeia, um a um, os **14 conteúdos obrigatórios** do bimestre
para arquivos reais do backend Java do projeto. Nada foi criado de forma
artificial: todos os conceitos são utilizados em funcionalidades efetivas do
sistema, exceto a tela Swing e o exemplo JDBC standalone, que existem
exclusivamente para fins didáticos conforme exigido pelo enunciado.

> Diretório-base: `backend-java/src/main/java/escola/`

| # | Conteúdo            | Onde está aplicado (arquivos)                                                            | Trecho-chave / símbolo                     |
|---|---------------------|------------------------------------------------------------------------------------------|--------------------------------------------|
| 1 | Classes e Objetos   | `model/Aluno.java`, `model/Professor.java`, `model/Turma.java`, `model/Disciplina.java`  | `class Aluno extends Pessoa`               |
| 2 | Construtores        | Todas as entidades em `model/` e serviços em `service/`                                  | `public Aluno(String nome, String cpf,...)`|
| 3 | Encapsulamento      | Todas as entidades — atributos `private` + getters/setters                               | `private String nome; public String getNome()` |
| 4 | Herança             | `model/Pessoa.java` (pai) → `Aluno`, `Professor`                                         | `class Aluno extends Pessoa`               |
| 5 | Interfaces          | `interfaces/Relatorio.java`, `dao/GenericDAO.java`                                       | `interface Relatorio { String gerar(...) }`|
| 6 | Classes Abstratas   | `model/Pessoa.java`                                                                      | `public abstract class Pessoa { abstract String apresentar(); }` |
| 7 | Polimorfismo        | `Main.java` (loop em `List<Relatorio>` despachando PDF/CSV); `List<Pessoa>` → forEach    | `for (Relatorio r : relatorios) pool.submit(...)` |
| 8 | Coleções do Java    | `Main.java`, `service/MatriculaService.java`, `model/Turma.java`                         | `ArrayList<Aluno>`, `List<Pessoa>`, `Map<>` |
| 9 | Java IO             | `util/Config.java` (lê `config.properties`); `service/RelatorioCSVService.java`; `service/RelatorioPDFService.java` | `Files.createDirectories(dir)`, `BufferedWriter` |
| 10| Enum                | `enums/TipoUsuario.java`; `model/DocumentoLegal.Tipo`; `model/Consentimento.Finalidade`  | `enum TipoUsuario { ALUNO, PROFESSOR, ... }` |
| 11| Exceções            | `exceptions/MatriculaInvalidaException.java`, `LgpdException.java`, `TermosNaoAceitosException.java`, `ConsentimentoAusenteException.java` | `throw new MatriculaInvalidaException(...)` |
| 12| Thread              | `threads/ProcessadorRelatorios.java` (`Runnable`), `threads/JobAnonimizacao.java`, `threads/JobRipd.java` (`ScheduledExecutorService`) | `pool.submit(new ProcessadorRelatorios(...))` |
| 13| Java Swing          | **`demo/DemoSwing.java`** (tela demonstrativa, separada do sistema principal)            | `JFrame`, `JTable`, `JButton`, `SwingUtilities.invokeLater` |
| 14| JDBC                | `dao/AlunoDAO.java` (CRUD real do sistema) **e** `demo/DemoJDBC.java` (exemplo didático) | `DriverManager.getConnection`, `PreparedStatement`, `ResultSet` |

## Arquivos criados nesta etapa

- `backend-java/src/main/java/escola/demo/DemoSwing.java` — tela Swing
  demonstrativa que lista os alunos cadastrados via JDBC.
- `backend-java/src/main/java/escola/demo/DemoJDBC.java` — exemplo
  standalone do ciclo completo JDBC (connect / DDL / insert / select /
  update / delete) com comentários didáticos linha-a-linha.
- `Relatorio_Conteudos_Academicos.md` — este relatório.

Nenhum arquivo existente foi modificado. O sistema principal continua
compilando e executando sem alterações de comportamento.

## Como executar e testar

Pré-requisitos: JDK 17+ e Maven instalados.

```bash
cd backend-java
mvn -q compile
```

### Sistema principal (inalterado)

```bash
mvn -q exec:java -Dexec.mainClass=escola.Main
# ou, após "mvn package":
java -jar target/backend-java-1.0.0-jar-with-dependencies.jar
```
Saída esperada: logs no console + arquivos em `backend-java/relatorios/`.

### Demo JDBC didática (Tópico 14)

```bash
mvn -q exec:java -Dexec.mainClass=escola.demo.DemoJDBC
```
Saída esperada (console):
```
[JDBC-DEMO] Conectado em: jdbc:sqlite:escola.db
[JDBC-DEMO] Linhas inseridas:
  id=1  ambiente = academico
  id=2  versao   = 1.0.0
[JDBC-DEMO] UPDATE afetou 1 linha(s).
[JDBC-DEMO] DELETE afetou 1 linha(s).
[JDBC-DEMO] Concluído com sucesso.
```

### Demo Swing didática (Tópico 13)

```bash
mvn -q exec:java -Dexec.mainClass=escola.demo.DemoSwing
```
Abre uma janela com a tabela de alunos lida do banco SQLite. O botão
"Recarregar do banco (JDBC)" reexecuta a consulta. Requer ambiente
gráfico (não funciona em terminal puro / SSH sem X11). No VS Code
local em Windows/macOS/Linux com desktop, abre normalmente.

> Caso o plugin `exec-maven-plugin` não esteja configurado, use o IDE
> (botão "Run" em `DemoSwing.main`) ou compile e rode com:
> ```bash
> mvn -q package
> java -cp target/backend-java-1.0.0-jar-with-dependencies.jar escola.demo.DemoSwing
> ```

## Justificativa de utilização

Todos os 12 primeiros conteúdos já estavam aplicados em funcionalidades
reais do sistema (modelo de domínio, persistência, geração de relatórios,
LGPD). Os tópicos 13 (Swing) e 14 (JDBC) ganharam, adicionalmente,
artefatos didáticos isolados em `escola.demo` para atender literalmente
ao enunciado — sem interferir no fluxo de produção e sem duplicar lógica
de negócio.
