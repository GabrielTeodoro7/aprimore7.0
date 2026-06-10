package escola.model;

import java.time.LocalTime;
import java.util.UUID;
import escola.interfaces.Versionavel;

/**
 * O QUE: Classe que representa um Turno (Matutino, Vespertino, etc).
 * POR QUE: Define a janela de tempo permitida para turmas e evita conflitos (RN.11).
 * CONTEÚDO ACADÊMICO: Herança (reutiliza lógica de versão), Encapsulamento, JDBC mapping.
 */
public class Turno implements Versionavel {
    private UUID id;
    private String nome;
    private LocalTime horaInicio;
    private LocalTime horaFim;
    private int versao;

    public Turno() {}

    public Turno(String nome, LocalTime horaInicio, LocalTime horaFim) {
        this.nome = nome;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.versao = 1;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }

    @Override
    public int getVersao() { return versao; }

    public void setVersao(int versao) { this.versao = versao; }

    @Override
    public void incrementarVersao() { 
        this.versao++; 
    }

    public boolean conflitaCom(Turno outro) {
        return (this.horaInicio.isBefore(outro.horaFim) && this.horaFim.isAfter(outro.horaInicio));
    }
}
