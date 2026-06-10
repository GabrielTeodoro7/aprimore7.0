# Back-end Java — Sistema Escolar

Projeto Maven com os 14 tópicos de POO, JDBC, Threads, IO e geração de PDF/CSV.

---

## 1. Pré-requisitos (instalar uma vez)

1. **Java 17 (JDK)** — https://adoptium.net/  
   Confirme no terminal: `java -version` (precisa mostrar 17+).
2. **Maven** — https://maven.apache.org/download.cgi  
   Confirme: `mvn -v`.  
   *(Alternativa: o próprio VS Code instala via extensão, ver passo 2.)*
3. **VS Code** — https://code.visualstudio.com/

## 2. Extensões do VS Code

Abra o VS Code → aba **Extensions** (Ctrl+Shift+X) e instale:

- **Extension Pack for Java** (Microsoft) — já traz Language Support, Debugger, Test Runner e Maven.
- **SQLite Viewer** (opcional, para abrir o `escola.db`).

Reinicie o VS Code depois de instalar.

## 3. Abrir o projeto

1. `File → Open Folder…` → selecione a pasta **`backend-java`** (não a raiz).
2. O VS Code vai detectar o `pom.xml` e começar a baixar dependências (canto inferior direito mostra o progresso). Aguarde terminar.

## 4. Rodar a aplicação

Tem 3 formas — escolha uma:

### a) Botão "Run" do VS Code
1. Abra `src/main/java/escola/Main.java`.
2. Acima do método `main`, clique em **▶ Run**.
3. A saída aparece no painel **Terminal/Debug Console**.

### b) Pelo terminal (Maven)
```bash
cd backend-java
mvn package
java -jar target/backend-java-1.0.0.jar
```

### c) Rodar com as dependências (sem fat-jar)
```bash
mvn package
java -cp "target/backend-java-1.0.0.jar:target/lib/*" escola.Main
# No Windows troque ":" por ";"
```

## 5. O que você vai ver

- Logs no terminal apresentando alunos/professor (polimorfismo).
- Arquivo `escola.db` criado na pasta (SQLite via JDBC).
- Pasta `relatorios/` com:
  - `relatorio_alunos.pdf` (abra no leitor de PDF)
  - `relatorio_alunos.csv` (abra no Excel ou VS Code)

## 6. Rodar os testes JUnit

```bash
mvn test
```
Ou clique no ícone **▶** ao lado de cada `@Test` em `src/test/java/escola/EscolaTest.java`.

## 7. Estrutura

```
backend-java/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/escola/
│   │   │   ├── Main.java
│   │   │   ├── dao/        (GenericDAO, AlunoDAO — JDBC)
│   │   │   ├── enums/      (TipoUsuario)
│   │   │   ├── exceptions/ (MatriculaInvalidaException)
│   │   │   ├── interfaces/ (Relatorio)
│   │   │   ├── model/      (Pessoa, Aluno, Professor, Turma, Disciplina)
│   │   │   ├── service/    (MatriculaService, RelatorioPDFService, RelatorioCSVService)
│   │   │   ├── threads/    (ProcessadorRelatorios)
│   │   │   └── util/       (Config, Log)
│   │   └── resources/
│   │       └── config.properties
│   └── test/java/escola/EscolaTest.java
```

## 8. Mapa dos 14 Tópicos

| # | Tópico | Onde |
|---|---|---|
| 1 | Classes e Objetos | `model/Aluno.java`, `Main.java` |
| 2 | Construtores | `Pessoa`, `Aluno`, `Professor`, `Turma`, `Disciplina` |
| 3 | Encapsulamento | atributos `private` + getters em todos os models |
| 4 | Herança | `Aluno extends Pessoa`, `Professor extends Pessoa` |
| 5 | Interfaces | `interfaces/Relatorio.java`, `dao/GenericDAO.java` |
| 6 | Classes Abstratas | `model/Pessoa.java` |
| 7 | Polimorfismo | `List<Pessoa>` e `List<Relatorio>` no `Main` |
| 8 | Coleções | `ArrayList`, `HashSet`, `HashMap`, `List`, `Set` |
| 9 | Java IO | `RelatorioPDFService`, `RelatorioCSVService`, `Config` |
| 10 | Enum | `enums/TipoUsuario.java` |
| 11 | Exceções | `MatriculaInvalidaException` + `try/catch` |
| 12 | Thread | `threads/ProcessadorRelatorios` + `ExecutorService` no `Main` |
| 13 | PDF (no lugar de Swing) | `service/RelatorioPDFService.java` + `RelatorioCSVService` |
| 14 | JDBC | `dao/AlunoDAO.java` (CRUD completo) |

## 9. Problemas comuns

- **`mvn: command not found`** → instale o Maven ou use o botão Run do VS Code.
- **`UnsupportedClassVersionError`** → JDK abaixo de 17. Instale o Temurin 17.
- **Build trava baixando** → primeiro `mvn package` baixa tudo, é normal demorar.
- **Nada acontece ao clicar Run** → aguarde o "Java: Importing projects..." terminar no canto inferior.
