package escola.dao;

import escola.exceptions.MatriculaInvalidaException;
import escola.model.Aluno;
import escola.util.Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

// =====================================================================
// TÓPICO 14 — JDBC (CRUD completo) + TÓPICO 5 (implements GenericDAO)
// =====================================================================
public class AlunoDAO implements GenericDAO<Aluno, Integer> {

    private final String url;

    public AlunoDAO() throws SQLException {
        this(Config.get("db.url"));
    }

    // Construtor extra para testes (banco em memória)
    public AlunoDAO(String url) throws SQLException {
        this.url = url;
        try (Connection c = conectar(); Statement st = c.createStatement()) {
            st.execute("""
                CREATE TABLE IF NOT EXISTS alunos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nome TEXT NOT NULL,
                    cpf TEXT NOT NULL,
                    matricula TEXT NOT NULL UNIQUE,
                    nota_media REAL NOT NULL
                )
            """);
        }
    }

    private Connection conectar() throws SQLException {
        return DriverManager.getConnection(url);
    }

    @Override
    public void inserir(Aluno a) throws SQLException, MatriculaInvalidaException {
        if (a.getMatricula() == null || a.getMatricula().length() < 4)
            throw new MatriculaInvalidaException("Matrícula inválida: " + a.getMatricula());
        String sql = "INSERT INTO alunos(nome,cpf,matricula,nota_media) VALUES(?,?,?,?)";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, a.getNome());
            ps.setString(2, a.getCpf());
            ps.setString(3, a.getMatricula());
            ps.setDouble(4, a.getNotaMedia());
            ps.executeUpdate();
        }
    }

    @Override
    public void atualizar(Aluno a) throws SQLException {
        String sql = "UPDATE alunos SET nome=?, cpf=?, nota_media=? WHERE matricula=?";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, a.getNome());
            ps.setString(2, a.getCpf());
            ps.setDouble(3, a.getNotaMedia());
            ps.setString(4, a.getMatricula());
            ps.executeUpdate();
        }
    }

    @Override
    public void remover(Integer id) throws SQLException {
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement("DELETE FROM alunos WHERE id=?")) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    @Override
    public Optional<Aluno> buscarPorId(Integer id) throws SQLException {
        String sql = "SELECT nome,cpf,matricula,nota_media FROM alunos WHERE id=?";
        try (Connection c = conectar(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Aluno(
                        rs.getString("nome"), rs.getString("cpf"),
                        rs.getString("matricula"), rs.getDouble("nota_media")));
                }
                return Optional.empty();
            }
        }
    }

    @Override
    public List<Aluno> listar() throws SQLException {
        List<Aluno> r = new ArrayList<>();
        try (Connection c = conectar();
             PreparedStatement ps = c.prepareStatement(
                 "SELECT nome,cpf,matricula,nota_media FROM alunos");
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                r.add(new Aluno(rs.getString("nome"), rs.getString("cpf"),
                                rs.getString("matricula"), rs.getDouble("nota_media")));
            }
        }
        return r;
    }
}
