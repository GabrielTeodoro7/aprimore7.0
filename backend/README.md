# Backend Java

O backend contém as regras executadas no servidor. A aplicação usa Java 25, Jakarta Servlet 6.1, JDBC e MySQL.

## Mapa rápido

```text
src/main/java/br/com/aprimore/
├── config/     configuração técnica e conexão com o banco
├── dao/        consultas e gravações SQL via JDBC
├── model/      representação dos dados
├── security/   filtros e controles de segurança
├── service/    operações de negócio reutilizáveis
├── servlet/    rotas HTTP e respostas da API
└── util/       funções compartilhadas
```

## Fluxo recomendado

`Requisição → filtros → Servlet → validação/regra → DAO/JDBC → MySQL → resposta JSON`

O fluxo exato varia conforme a operação. A autorização deve ser verificada no servidor, não somente pela interface.

## Arquivos importantes

- `pom.xml`: versões, bibliotecas, testes e geração do WAR.
- `src/main/webapp/WEB-INF/web.xml`: configuração web e sessão.
- `src/test/java/`: testes automatizados.

## Compilar e testar

A partir da raiz do repositório:

```bash
cd backend
mvn clean verify
```

O comando precisa de JDK 25 e acesso às dependências Maven. A compilação não substitui testes integrados com MySQL, servidor Servlet e SMTP.
