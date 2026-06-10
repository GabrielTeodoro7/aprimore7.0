package escola.model;

import java.time.LocalDate;
import java.util.UUID;

public class Feriado {
    private final UUID id;
    private final String nome;
    private final LocalDate data;
    private final Tipo tipo;

    public enum Tipo { FIXO, VARIAVEL, FACULTATIVO }

    public Feriado(UUID id, String nome, LocalDate data, Tipo tipo) {
        this.id = id;
        this.nome = nome;
        this.data = data;
        this.tipo = tipo;
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public LocalDate getData() { return data; }
    public Tipo getTipo() { return tipo; }
}
