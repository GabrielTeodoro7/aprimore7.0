package escola.model;

import java.time.Instant;

// =============================================================================
// PoliticaSenha — POJO da configuração de senha (RN.01 / RN.02 / RN.62).
// -----------------------------------------------------------------------------
// O QUE FAZ: representa uma linha de `politica_senha` no banco.
// POR QUE FOI UTILIZADO: serviços de senha precisam de uma fonte única e
// imutável de configuração; passar parâmetros soltos é frágil.
// QUANDO UTILIZAR: sempre que um SenhaService for validar uma nova senha.
// CONTEÚDO ACADÊMICO:
//   - Classes e Objetos (POJO).
//   - Encapsulamento (campos `private final` + getters).
//   - Construtores (construtor completo).
// =============================================================================
public class PoliticaSenha {
    private final String escopo;
    private final int minTamanho;
    private final boolean exigeMaiuscula;
    private final boolean exigeMinuscula;
    private final boolean exigeNumero;
    private final boolean exigeSimbolo;
    private final int historicoN;
    private final int expiracaoDias;
    private final int maxTentativas;
    private final int janelaLockMin;
    private final Instant atualizadoEm;

    public PoliticaSenha(String escopo, int minTamanho,
                         boolean exigeMaiuscula, boolean exigeMinuscula,
                         boolean exigeNumero, boolean exigeSimbolo,
                         int historicoN, int expiracaoDias,
                         int maxTentativas, int janelaLockMin,
                         Instant atualizadoEm) {
        this.escopo = escopo;
        this.minTamanho = minTamanho;
        this.exigeMaiuscula = exigeMaiuscula;
        this.exigeMinuscula = exigeMinuscula;
        this.exigeNumero = exigeNumero;
        this.exigeSimbolo = exigeSimbolo;
        this.historicoN = historicoN;
        this.expiracaoDias = expiracaoDias;
        this.maxTentativas = maxTentativas;
        this.janelaLockMin = janelaLockMin;
        this.atualizadoEm = atualizadoEm;
    }

    // Construtor padrão de fallback usado quando a tabela ainda não foi
    // populada (modo seguro: política mais conservadora).
    // CONTEÚDO ACADÊMICO: construtores sobrecarregados.
    public PoliticaSenha() {
        this("global", 10, true, true, true, true, 5, 180, 5, 15, Instant.now());
    }

    public String getEscopo() { return escopo; }
    public int getMinTamanho() { return minTamanho; }
    public boolean isExigeMaiuscula() { return exigeMaiuscula; }
    public boolean isExigeMinuscula() { return exigeMinuscula; }
    public boolean isExigeNumero() { return exigeNumero; }
    public boolean isExigeSimbolo() { return exigeSimbolo; }
    public int getHistoricoN() { return historicoN; }
    public int getExpiracaoDias() { return expiracaoDias; }
    public int getMaxTentativas() { return maxTentativas; }
    public int getJanelaLockMin() { return janelaLockMin; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
}
