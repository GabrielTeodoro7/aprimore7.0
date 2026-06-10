package escola.model;

import java.time.LocalDateTime;
import java.util.UUID;

// =====================================================================
// ONDA B.1 — LGPD (RN.05)
// Representa uma versão de um documento legal (Termos de Uso ou
// Política de Privacidade). Espelha a tabela public.documentos_legais.
// =====================================================================
public class DocumentoLegal {

    public enum Tipo {
        TERMOS_USO,
        POLITICA_PRIVACIDADE
    }

    private final UUID id;
    private final Tipo tipo;
    private final String versao;
    private final String texto;
    private final LocalDateTime vigenteEm;
    private final boolean obrigatorio;

    public DocumentoLegal(UUID id, Tipo tipo, String versao, String texto,
                          LocalDateTime vigenteEm, boolean obrigatorio) {
        this.id = id;
        this.tipo = tipo;
        this.versao = versao;
        this.texto = texto;
        this.vigenteEm = vigenteEm;
        this.obrigatorio = obrigatorio;
    }

    public UUID getId() { return id; }
    public Tipo getTipo() { return tipo; }
    public String getVersao() { return versao; }
    public String getTexto() { return texto; }
    public LocalDateTime getVigenteEm() { return vigenteEm; }
    public boolean isObrigatorio() { return obrigatorio; }
}
