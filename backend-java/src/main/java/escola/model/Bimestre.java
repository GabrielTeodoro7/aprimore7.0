package escola.model;

import java.util.UUID;

/**
 * O QUE: Modelo para Bimestre escolar.
 * POR QUE: RN.16 exige que as notas estejam vinculadas ao status (aberto/fechado) do bimestre.
 * CONTEÚDO ACADÊMICO: Classes e Objetos, Enum.
 */
public class Bimestre {
    private UUID id;
    private UUID anoLetivoId;
    private int numero;
    private boolean aberto;

    public Bimestre(UUID anoLetivoId, int numero) {
        if (numero < 1 || numero > 4) throw new IllegalArgumentException("Número do bimestre deve ser 1 a 4.");
        this.anoLetivoId = anoLetivoId;
        this.numero = numero;
        this.aberto = true;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public boolean isAberto() { return aberto; }
    public void setAberto(boolean aberto) { this.aberto = aberto; }
}
