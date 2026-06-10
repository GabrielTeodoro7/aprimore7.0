# Índice Acadêmico — 14 Conteúdos de Java no Backend

> Documento destinado à correção acadêmica. Para cada um dos 14 conteúdos
> obrigatórios do bimestre, este índice indica **arquivo**, **trecho
> principal**, **motivo de uso**, **conceito demonstrado** e **como testar**.
> Caminhos são relativos a `backend-java/src/main/java/escola/`.

---

## 1. Classes e Objetos

- **Arquivo:** `model/Aluno.java`, `model/Professor.java`, `model/Turma.java`, `model/Disciplina.java`
- **Trecho principal:**
  ```java
  public class Aluno extends Pessoa {
      private final String matricula;
      private double notaMedia;
      // ...
  }
  ```
- **Motivo:** modelar entidades do domínio escolar (aluno, professor, turma, disciplina) como objetos do sistema.
- **Conceito demonstrado:** definição de classes e criação de objetos no contexto OO.
- **Como testar:**
  ```java
  Aluno a = new Aluno("Ana", "111", "2024001", 8.5);
  System.out.println(a.getNome()); // "Ana"
  ```
  Executado em `Main.java` ao rodar `mvn exec:java -Dexec.mainClass=escola.Main`.

## 2. Construtores

- **Arquivo:** `model/Aluno.java` (e demais em `model/`).
- **Trecho principal:**
  ```java
  public Aluno(String nome, String cpf, String matricula, double notaMedia) {
      super(nome, cpf);            // chama construtor da superclasse Pessoa
      this.matricula = matricula;
      this.notaMedia = notaMedia;
  }
  ```
- **Motivo:** garantir que toda instância nasce em estado válido (matrícula obrigatória, herança inicializada via `super`).
- **Conceito demonstrado:** construtores parametrizados + chamada `super(...)`.
- **Como testar:** instanciar com argumentos inválidos lança `MatriculaInvalidaException` em `AlunoDAO.inserir(...)`.

## 3. Encapsulamento

- **Arquivo:** todas as classes em `model/`.
- **Trecho principal:**
  ```java
  private String nome;            // atributo privado
  public String getNome() { return nome; }
  public void setNome(String n) { this.nome = n; }
  ```
- **Motivo:** impedir acesso direto aos campos e centralizar regras de validação em getters/setters.
- **Conceito demonstrado:** modificadores de acesso `private` e API pública controlada.
- **Como testar:** tentar `aluno.nome = "x"` direto não compila (campo `private`).

## 4. Herança

- **Arquivo:** `model/Pessoa.java` (pai) e `model/Aluno.java`, `model/Professor.java` (filhos).
- **Trecho principal:**
  ```java
  public abstract class Pessoa { ... }
  public class Aluno     extends Pessoa { ... }
  public class Professor extends Pessoa { ... }
  ```
- **Motivo:** evitar repetição dos atributos comuns (`nome`, `cpf`) e padronizar comportamento de identificação.
- **Conceito demonstrado:** `extends`, reutilização de campos/métodos do supertipo.
- **Como testar:** `Aluno a = new Aluno(...); a.getNome();` — getter herdado de `Pessoa`.

## 5. Interfaces

- **Arquivos:** `interfaces/Relatorio.java`, `dao/GenericDAO.java`.
- **Trecho principal:**
  ```java
  public interface Relatorio {
      String getFormato();
      void gerar(List<Aluno> alunos, String destino) throws Exception;
  }
  ```
- **Motivo:** desacoplar a geração de relatórios (PDF/CSV) da camada que orquestra a execução; trocar implementação sem alterar `Main`.
- **Conceito demonstrado:** contrato `interface` + múltiplas implementações.
- **Como testar:** `Main` itera sobre `List<Relatorio> = List.of(new RelatorioPDFService(), new RelatorioCSVService())` e gera ambos os formatos.

## 6. Classes Abstratas

- **Arquivo:** `model/Pessoa.java`.
- **Trecho principal:**
  ```java
  public abstract class Pessoa {
      protected final String nome;
      protected final String cpf;
      public Pessoa(String nome, String cpf) { this.nome = nome; this.cpf = cpf; }
      public abstract String apresentar();   // obriga subclasses a implementar
  }
  ```
- **Motivo:** fornecer base comum com estado, sem permitir instanciar `Pessoa` diretamente — só `Aluno`/`Professor` fazem sentido.
- **Conceito demonstrado:** `abstract class` + método abstrato.
- **Como testar:** `new Pessoa(...)` não compila; `Aluno.apresentar()` retorna "Aluno Ana — matrícula 2024001".

## 7. Polimorfismo

- **Arquivo:** `Main.java` (uso) + `service/RelatorioPDFService.java` / `service/RelatorioCSVService.java`.
- **Trecho principal:**
  ```java
  List<Relatorio> relatorios = List.of(new RelatorioPDFService(), new RelatorioCSVService());
  for (Relatorio r : relatorios) {           // mesma chamada
      pool.submit(new ProcessadorRelatorios(r, doBanco, saida));
  }
  ```
- **Motivo:** uma única laçada gera saídas em formatos diferentes — a JVM despacha para a implementação concreta certa em tempo de execução.
- **Conceito demonstrado:** polimorfismo de inclusão via interface.
- **Como testar:** após `mvn exec:java -Dexec.mainClass=escola.Main`, `backend-java/relatorios/` contém `relatorio_alunos.pdf` **e** `relatorio_alunos.csv`.

## 8. Coleções

- **Arquivos:** `Main.java`, `service/MatriculaService.java`, `model/Turma.java`.
- **Trecho principal:**
  ```java
  List<Pessoa>    pessoas    = new ArrayList<>(List.of(a1, a2, p1));
  List<Disciplina> grade     = new ArrayList<>();   // em Turma
  Map<String, Aluno> indice  = new HashMap<>();     // em MatriculaService
  ```
- **Motivo:** armazenar conjuntos de entidades, indexar por matrícula, iterar para apresentação/relatório.
- **Conceito demonstrado:** `List`, `ArrayList`, `Map`, `HashMap` do `java.util`.
- **Como testar:** `t.matricular(a1); t.matricular(a2); System.out.println(t.getAlunos().size());`.

## 9. Java IO

- **Arquivos:** `util/Config.java` (leitura), `service/RelatorioCSVService.java`, `service/RelatorioPDFService.java` (escrita).
- **Trecho principal:**
  ```java
  try (InputStream in = Config.class.getResourceAsStream("/config.properties")) { ... }
  Files.createDirectories(Path.of(Config.get("relatorio.dir")));
  try (BufferedWriter w = Files.newBufferedWriter(saida)) { w.write(linha); }
  ```
- **Motivo:** ler configuração externa do classpath e gerar arquivos de relatório no disco.
- **Conceito demonstrado:** `java.nio.file.*`, `InputStream`, `BufferedWriter`, `try-with-resources`.
- **Como testar:** após executar `Main`, conferir os arquivos em `backend-java/relatorios/`.

## 10. Enum

- **Arquivos:** `enums/TipoUsuario.java`, `model/DocumentoLegal.Tipo`, `model/Consentimento.Finalidade`.
- **Trecho principal:**
  ```java
  public enum TipoUsuario { ALUNO, PROFESSOR, ADMIN, CEO }
  public enum Finalidade  { CADASTRO, IMAGEM, COMUNICACOES, COMPARTILHAMENTO }
  ```
- **Motivo:** representar conjuntos finitos e fechados de valores (perfis de usuário, finalidades de consentimento LGPD).
- **Conceito demonstrado:** `enum` como tipo seguro alternativo a `String`/`int` mágico.
- **Como testar:** `if (u.getTipo() == TipoUsuario.ADMIN) ...` — compilador rejeita valor inválido.

## 11. Exceções

- **Arquivos:** `exceptions/MatriculaInvalidaException.java`, `LgpdException.java`, `TermosNaoAceitosException.java`, `ConsentimentoAusenteException.java`.
- **Trecho principal:**
  ```java
  if (a.getMatricula().length() < 4)
      throw new MatriculaInvalidaException("Matrícula inválida: " + a.getMatricula());
  ```
- **Motivo:** sinalizar violações de regra de negócio (matrícula curta, termos não aceitos, consentimento ausente) de forma checada/tratável pela camada chamadora.
- **Conceito demonstrado:** hierarquia de `Exception` customizada + `throw` / `catch`.
- **Como testar:** `dao.inserir(new Aluno("X","Y","12",0))` lança `MatriculaInvalidaException`.

## 12. Thread

- **Arquivos:** `threads/ProcessadorRelatorios.java` (`Runnable`), `threads/JobAnonimizacao.java`, `threads/JobRipd.java` (`ScheduledExecutorService`).
- **Trecho principal:**
  ```java
  ExecutorService pool = Executors.newFixedThreadPool(Config.getInt("thread.pool.size"));
  for (Relatorio r : relatorios) pool.submit(new ProcessadorRelatorios(r, alunos, saida));
  pool.shutdown(); pool.awaitTermination(10, TimeUnit.SECONDS);
  ```
- **Motivo:** gerar múltiplos relatórios em paralelo e executar jobs LGPD (anonimização e RIPD) periodicamente em segundo plano.
- **Conceito demonstrado:** `Runnable`, `ExecutorService`, `ScheduledExecutorService`.
- **Como testar:** rodar `Main` — logs mostram threads paralelas (`pool-1-thread-...`); jobs LGPD agendados via `ScheduledExecutorService` no startup.

## 13. Swing

- **Arquivo:** `demo/DemoSwing.java`.
- **Trecho principal:**
  ```java
  SwingUtilities.invokeLater(() -> {
      JFrame frame = new JFrame("Demo Swing — Lista de Alunos");
      frame.setLayout(new BorderLayout());
      frame.add(new JScrollPane(new JTable(modelo)), BorderLayout.CENTER);
      frame.setVisible(true);
  });
  ```
- **Motivo:** evidenciar Java Swing em uma tela demonstrativa isolada do fluxo principal, conforme exigência acadêmica.
- **Conceito demonstrado:** `JFrame`, `JTable`, `JButton`, `ActionListener` e Event Dispatch Thread.
- **Como testar:**
  ```bash
  cd backend-java
  mvn -q package
  java -cp target/backend-java-1.0.0-jar-with-dependencies.jar escola.demo.DemoSwing
  ```

## 14. JDBC

- **Arquivos:** `dao/AlunoDAO.java` (CRUD real do sistema) **e** `demo/DemoJDBC.java` (exemplo didático).
- **Trecho principal:**
  ```java
  try (Connection c  = DriverManager.getConnection(Config.get("db.url"));
       PreparedStatement ps = c.prepareStatement(
           "INSERT INTO alunos(nome,cpf,matricula,nota_media) VALUES(?,?,?,?)")) {
      ps.setString(1, a.getNome());
      ps.setString(2, a.getCpf());
      ps.setString(3, a.getMatricula());
      ps.setDouble(4, a.getNotaMedia());
      ps.executeUpdate();
  }
  ```
- **Motivo:** persistir alunos no SQLite via JDBC com `PreparedStatement` (parametrização segura).
- **Conceito demonstrado:** `DriverManager`, `Connection`, `PreparedStatement`, `ResultSet`, `try-with-resources`.
- **Como testar:**
  ```bash
  mvn -q exec:java -Dexec.mainClass=escola.demo.DemoJDBC
  ```
  Saída esperada já documentada em `Relatorio_Conteudos_Academicos.md`.

---

## Resumo rápido (cheatsheet do corretor)

| #  | Conteúdo            | Arquivo-chave                                    |
|----|---------------------|--------------------------------------------------|
| 1  | Classes e Objetos   | `model/Aluno.java`                               |
| 2  | Construtores        | `model/Aluno.java` (super(...))                  |
| 3  | Encapsulamento      | `model/Pessoa.java` (private + getters)          |
| 4  | Herança             | `Aluno extends Pessoa`                           |
| 5  | Interfaces          | `interfaces/Relatorio.java`                      |
| 6  | Classes Abstratas   | `model/Pessoa.java` (abstract)                   |
| 7  | Polimorfismo        | `Main.java` (List<Relatorio>)                    |
| 8  | Coleções            | `Main.java`, `Turma.java`                        |
| 9  | Java IO             | `util/Config.java`, `RelatorioCSVService.java`   |
| 10 | Enum                | `enums/TipoUsuario.java`                         |
| 11 | Exceções            | `exceptions/*.java`                              |
| 12 | Thread              | `threads/*.java`                                 |
| 13 | Swing               | `demo/DemoSwing.java`                            |
| 14 | JDBC                | `dao/AlunoDAO.java`, `demo/DemoJDBC.java`        |

---

## Atualização Onda B.3 (LGPD — Direitos do Titular)

Novas classes que reforçam os conteúdos acadêmicos:

| Conteúdo            | Arquivo / Trecho |
|---------------------|------------------|
| Interface           | `service/SoftDeleteService.java` → `interface SoftDeletavel` |
| Polimorfismo        | `service/SoftDeleteService.java` → `excluirLogicamente(T)` aceita qualquer `SoftDeletavel` |
| Genéricos           | `service/SoftDeleteService.java` → `<T extends SoftDeletavel>` |
| Enum                | `service/LogAcessoSensivelService.java` → `enum Campo { CPF, NOTA_INDIVIDUAL, ENDERECO, TELEFONE, OUTRO }` |
| Encapsulamento/POJO | `service/LogAcessoSensivelService.java` → classe interna `RegistroAcesso` com campos `final` e getters |
| Tratamento de exceções | `service/LogAcessoSensivelService.java` → `throw new IllegalArgumentException(...)` |


---

# Onda C — Sub-fase C.1 (Segurança e Identidade)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/PoliticaSenha.java`, `model/Senha.java`, `model/TentativaLogin.java`, `model/Bloqueio.java`, `model/DominioInstitucional.java`, `model/AnomaliaAcesso.java` |
| 2. Construtores | `model/PoliticaSenha.java` (construtor completo + sobrecarregado padrão); `model/TentativaLogin.java` (construtor curto via `this(...)`) |
| 3. Encapsulamento | Todos os POJOs novos: campos `private final` + getters; `HashSenhaPBKDF2` com construtor privado |
| 4. Herança | `model/RefreshToken.java extends TokenSeguro`, `model/TokenRecuperacao.java extends TokenSeguro` |
| 5. Interfaces | `interfaces/Versionavel.java` (contrato para a Onda C.2 — `Versionador` polimórfico) |
| 6. Classes Abstratas | `model/TokenSeguro.java` — base abstrata para tokens hash-only (RN.03 / RN.07) |
| 7. Polimorfismo | `TokenSeguro.estaValido()` sobrescrita em `RefreshToken` e `TokenRecuperacao`; chamadas polimórficas em `RecuperacaoSenhaService.confirmar()` |
| 8. Coleções | `service/SenhaService.java` → `List<String>` motivos, `List<Senha>` histórico; `service/RecuperacaoSenhaService.java` → `ConcurrentHashMap<String,TokenRecuperacao>`; `service/DominioInstitucionalService.java` → `HashSet<String>`; `service/AnomaliaService.java` → `HashMap<UUID,Perfil>` |
| 9. Java IO | (reutiliza `RelatorioPDFService` / `RelatorioCSVService` da Onda anterior; novos jobs de IO entram na C.2) |
| 10. Enum | `model/TentativaLogin.Motivo`, `model/AnomaliaAcesso.Tipo`, `model/AnomaliaAcesso.Gravidade` |
| 11. Exceções | 6 novas exceptions: `ContaBloqueadaException`, `SenhaFracaException`, `SenhaReutilizadaException`, `DominioNaoAutorizadoException`, `AnomaliaAcessoException`, `TokenRecuperacaoInvalidoException` |
| 12. Thread | `threads/JobLimpezaTokens.java` (ScheduledExecutorService, daemon thread); `service/BloqueioService.java` (ReentrantLock na seção crítica de criação de bloqueio) |
| 13. Swing | Mantido em `demo/DemoSwing.java` (não modificado) |
| 14. JDBC | `dao/SenhaHistoricoDAO.java`, `dao/TentativaLoginDAO.java`, `dao/BloqueioContaDAO.java` — todos com `PreparedStatement`, `ResultSet`, `Connection` e `try-with-resources` |

---

# Onda C — Sub-fase C.2 (Vida Acadêmica - Lote 1)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/AnoLetivo.java`, `model/Turno.java` |
| 2. Construtores | `model/AnoLetivo.java` (parametrizado); `model/Turno.java` (encadeado) |
| 3. Encapsulamento | Getters e Setters protegendo atributos de data e hora em `AnoLetivo` e `Turno` |
| 5. Interfaces | `interfaces/Versionavel.java` implementada por todos os modelos acadêmicos para RN.50 |
| 7. Polimorfismo | `VersionadorService.validar(T extends Versionavel)` tratando qualquer objeto versionável de forma genérica |
| 11. Exceções | `exceptions/ConflitoEdicaoException.java` sinalizando violação de concorrência |

---

# Onda C — Sub-fase C.2 (Vida Acadêmica - Lote 2)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/Pdi.java`, `model/MetaPdi.java`, `model/Bimestre.java` |
| 2. Construtores | `model/MetaPdi.java` (parametrização obrigatória para estado válido) |
| 3. Encapsulamento | Getters/Setters em `Pdi` e `MetaPdi`; lógica de validação de comentário em `MetaPdi.setConcluida` (RN.21) |
| 11. Exceções | `exceptions/AcademicoException.java` centralizando erros de RN.14, RN.15 e RN.47 |
| 12. Thread | `threads/JobAlertaMetas.java` utilizando `ScheduledExecutorService` para alertar metas vencidas (RN.22) |

---

# Onda C — Sub-fase C.2 (Vida Acadêmica - Lote 3)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/Turma.java` (reforçado com Regência) |
| 3. Encapsulamento | `AcademicoService.validarRegencia` protegendo a integridade dos turnos |
| 8. Coleções | `AcademicoService.validarRegencia` iterando sobre `List<Turma>` para detectar conflitos |
| 11. Exceções | `AcademicoException` disparada em conflitos de Regência (RN.12) ou Prazos (RN.15) |

> Todos os arquivos novos contêm cabeçalho didático no formato
> **O QUE / POR QUE / QUANDO / CONTEÚDO ACADÊMICO** logo após o `package`.



---

# Onda C — Sub-fase C.3 (Acessibilidade e Comunicação)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/PreferenciaAcessibilidade.java`, `model/PranchaComunicacao.java`, `model/Denuncia.java` |
| 3. Encapsulamento | Getters em `PreferenciaAcessibilidade` e `Denuncia`; uso de Enums internos |
| 8. Coleções | Uso de `Optional` em `PreferenciaAcessibilidadeDAO.buscarPorUsuario` |
| 10. Enum | `PreferenciaAcessibilidade.Daltonismo`, `Denuncia.Status` |
| 11. Exceções | Validação de argumentos em `AcessibilidadeService` e `ComunicacaoService` |
| 14. JDBC | `dao/PreferenciaAcessibilidadeDAO.java`, `dao/DenunciaDAO.java` usando `PreparedStatement` e `upsert` |

---

# Onda C — Sub-fase C.4 (Operação e Configuração)

| Conteúdo | Onde aparece nesta sub-fase |
|----------|------------------------------|
| 1. Classes e Objetos | `model/Feriado.java`, `model/ApiKey.java`, `model/RelatorioJob.java`, `model/LimitePlano.java` |
| 8. Coleções | `LimitePlanoService` usando `HashMap` para gerenciar quotas de recursos |
| 11. Exceções | `ApiKeyInvalidaException`, `LimitePlanoExcedidoException` para controle operacional |
| 12. Thread | `JobRelatorios` processando fila em background via `ScheduledExecutorService` |
| 14. JDBC | `RelatorioJobDAO` e `ApiKeyDAO` com transações simples e PreparedStatements |

---

# Onda D — Lote 2 (Offline e IA)

| Conteúdo | Arquivo | Descrição |
|----------|---------|-----------|
| Classes e Objetos | `model/SyncQueue.java` | Modelagem da fila de sincronização offline para resiliência (RN.53). |
| Encapsulamento | `model/SyncQueue.java` | Proteção de estado do item de sincronização via getters/setters. |
| Coleções (List) | `service/IAService.java` | Processamento de `List<Double>` para cálculo de tendências acadêmicas. |
| Lógica de Programação | `service/IAService.java` | Algoritmo de análise preditiva baseado em médias de desempenho (RN.59). |

---

# Onda D — Lote 3 (Secretaria e Financeiro)

| Conteúdo | Arquivo | Descrição |
|----------|---------|-----------|
| BigDecimal | `model/Mensalidade.java` | Uso de precisão decimal para valores financeiros (RN.74). |
| Encapsulamento | `model/Mensalidade.java` | Regras de cálculo de juros encapsuladas no modelo. |
| Coleções (containsAll) | `service/SecretariaService.java` | Validação de conjunto de documentos obrigatórios (RN.71). |

---

# Onda D — Lote 4 (BI e Relatórios Avançados)

| Conteúdo | Arquivo | Descrição |
|----------|---------|-----------|
| Java Streams | `service/BiService.java` | Filtragem funcional de dados analíticos (RN.66). |
| Coleções (List/ArrayList) | `service/BiService.java` | Gerenciamento de histórico consolidado para relatórios. |
| POJO | `model/BiData.java` | Estrutura de dados para suporte a dashboards de BI (RN.65). |
