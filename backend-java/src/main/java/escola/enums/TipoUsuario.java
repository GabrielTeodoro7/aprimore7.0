package escola.enums;

// =====================================================================
// TÓPICO 10 — ENUM
// Enumeração fixa dos perfis de usuário do sistema escolar.
// Enums em Java podem ter campos, construtores e métodos.
// =====================================================================
public enum TipoUsuario {
    ALUNO("Aluno"),
    PROFESSOR("Professor"),
    ADMIN("Administrador");

    private final String descricao;

    TipoUsuario(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
