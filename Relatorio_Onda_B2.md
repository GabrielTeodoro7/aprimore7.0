# Relatório — Onda B.2 (Aceite de Termos + Consentimentos)

> Sub-fase B.2 da implementação LGPD. Concentra-se em **RN.05** (aceite
> obrigatório com reaceite por versão) e **RN.45** (consentimento granular
> por finalidade). Estende a fundação criada na Onda B.1 sem remover ou
> substituir nada do backend Java existente.

## 1. Arquivos alterados / criados

### Frontend (TypeScript / React)
| Tipo | Caminho | Descrição |
|------|---------|-----------|
| criado  | `src/components/TermsGate.tsx`    | Gate modal pós-login que bloqueia o app até o usuário aceitar a versão vigente de cada documento legal obrigatório. |
| criado  | `src/routes/privacidade.tsx`      | Página "Central de Privacidade" — usuário concede/revoga cada finalidade de tratamento de dados. |
| editado | `src/routes/__root.tsx`           | Monta `<TermsGate />` dentro do `RootComponent`, dentro do `AccessibilityProvider`. |

### Backend Java
Nenhum arquivo Java foi **removido** ou **substituído**. As classes B.1
existentes (`TermosService`, `ConsentimentoService`, `TermoAceito`,
`Consentimento`, `DocumentoLegal`, exceções) já cobrem as regras de negócio
de B.2 e seguem servindo como referência arquitetural canônica.

Os demos didáticos `escola.demo.DemoSwing` e `escola.demo.DemoJDBC`
**continuam isolados** em `backend-java/src/main/java/escola/demo/` e
**não são chamados** por `escola.Main`. ✅

### Documentação
| Tipo | Caminho |
|------|---------|
| criado | `backend-java/CONTEUDOS_JAVA.md` — índice acadêmico detalhado dos 14 conteúdos com arquivo, trecho, motivo, conceito e como testar. |
| criado | `Relatorio_Onda_B2.md` (este arquivo). |

## 2. Tabelas, colunas, triggers e constraints

Tudo já havia sido criado na Onda B.1; nesta sub-fase apenas **utilizamos**
o schema, sem alterá-lo:

- `documentos_legais (id, tipo, versao, texto, vigente_em, obrigatorio)` — já populada com `TERMOS_USO v2026.1` e `POLITICA_PRIVACIDADE v2026.1`.
- `termos_aceitos (id, profile_id, documento_id, aceito_em, ip, user_agent)` — INSERT-only (UPDATE/DELETE bloqueados por trigger de imutabilidade).
- `consentimentos (id, profile_id, finalidade, concedido, concedido_em, revogado_em, ip, user_agent)` — UNIQUE `(profile_id, finalidade)`, com trigger `update_updated_at` já ativo.

Triggers e RLS já existentes que sustentam B.2:
- `audit_block_mutation` em `audit_logs` e `termos_aceitos` (imutabilidade).
- Policies `ta_self_ins`, `ta_self_sel` (apenas o próprio profile aceita/lê seu termo).
- Policies `cs_self` (apenas o próprio profile concede/revoga consentimento).

## 3. Mapeamento de regras — onde cada validação vive

| Regra | Frontend | Banco | Backend Java |
|------|----------|-------|--------------|
| RN.05 — bloquear app até aceite | `TermsGate.tsx` (modal não dispensável) | RLS `ta_self_ins` permite só o próprio profile | `TermosService.exigirAceiteVigente()` lança `TermosNaoAceitosException` |
| RN.05 — registrar versão + timestamp + UA | INSERT em `termos_aceitos` com `documento_id` da versão vigente | `aceito_em DEFAULT now()` | `TermosService.aceitar(profileId, documentoId, ip, ua)` |
| RN.05 — imutabilidade do aceite | n/a | Trigger `block_audit_mutation` em `termos_aceitos` | imutável por design (campos `final`) |
| RN.45 — conceder / revogar | `/privacidade` toggles | `consentimentos` (1 linha por finalidade, UNIQUE) | `ConsentimentoService.conceder()` / `revogar()` |
| RN.45 — bloquear ação sem consentimento | toast no toggle obrigatório | n/a | `ConsentimentoService.exigir()` lança `ConsentimentoAusenteException` |

## 4. Como testar

### 4.1 Aceite de Termos (RN.05)
1. Crie uma conta nova (ou faça login com uma conta que ainda não aceitou).
2. Logo após autenticar, um modal **"Termos de Uso — versão 2026.1"** aparece.
   Não há botão de fechar; ESC e clique fora também não fecham.
3. Clique em **"Li e aceito"** → registro inserido em `termos_aceitos`.
4. Em seguida o modal exibe **"Política de Privacidade — versão 2026.1"**.
5. Após aceitar, navegação volta ao normal.
6. Verifique no banco:
   ```sql
   SELECT documento_id, aceito_em, user_agent
     FROM termos_aceitos
    WHERE profile_id = '<seu profile id>';
   ```

### 4.2 Central de Privacidade (RN.45)
1. Acesse `/privacidade`.
2. A finalidade **CADASTRO** aparece travada (obrigatória, conforme legislação).
3. Alterne as demais (IMAGEM, COMUNICAÇÕES, COMPARTILHAMENTO).
4. Cada toggle dispara INSERT ou UPDATE em `consentimentos`, com `concedido_em` ou `revogado_em` preenchido.
5. Verifique:
   ```sql
   SELECT finalidade, concedido, concedido_em, revogado_em
     FROM consentimentos
    WHERE profile_id = '<seu profile id>';
   ```

### 4.3 Reaceite por nova versão
1. Inserir nova versão do termo:
   ```sql
   INSERT INTO documentos_legais(tipo, versao, texto, vigente_em, obrigatorio)
   VALUES ('TERMOS_USO', '2026.2', '<novo texto>', now(), true);
   ```
2. Recarregar a aplicação → modal volta a aparecer pedindo aceite da v2026.2.

### 4.4 Backend Java (regras espelhadas)
```bash
cd backend-java
mvn -q compile
mvn -q exec:java -Dexec.mainClass=escola.Main      # fluxo principal: continua funcionando
mvn -q exec:java -Dexec.mainClass=escola.demo.DemoJDBC   # demo didática JDBC
mvn -q exec:java -Dexec.mainClass=escola.demo.DemoSwing  # demo didática Swing
```

## 5. Build e regressões

- **Frontend:** `bun run build` (executado pelo harness) — sem erros TypeScript.
  Imports usados: `@/components/ui/{dialog,scroll-area,switch,card,button,label}` — todos já existem.
- **Backend Java:** `mvn -q compile` — nenhuma classe alterada/removida; apenas
  arquivos novos foram adicionados em `escola/demo/` (Onda anterior). Build limpo
  esperado em VS Code local.
- **Banco:** nenhuma migração nova nesta sub-fase. Estado pós-B.1 mantido.

## 6. Confirmação de premissas (checklist do usuário)

- [x] DemoSwing e DemoJDBC permanecem isolados em `escola.demo/`.
- [x] Backend Java preservado — nenhum arquivo removido/substituído.
- [x] Nenhuma funcionalidade existente alterada.
- [x] Implementados apenas RNs explícitos (RN.05, RN.45).
- [x] Versão do termo, timestamp e usuário registrados.
- [x] Rastreabilidade e auditoria garantidas (imutabilidade via trigger + RLS).
- [x] Frontend / banco / backend Java compatíveis e documentados.

## 7. Pendências para sub-fases seguintes

- **B.3 — Direitos do titular:**
  - RN.31 (soft delete já modelado no schema; falta UI de exclusão).
  - RN.32 (anonimização após 5 anos — `JobAnonimizacao` já existe, falta endpoint manual + cron).
  - RN.34 (exportação de dados em ZIP + Storage signed URL 7 dias).
  - RN.46 (geração trimestral de RIPD — `JobRipd` já existe, falta UI de download).
  - RN.63 (log de acesso a dados sensíveis com justificativa).
