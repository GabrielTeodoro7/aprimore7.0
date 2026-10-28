package br.com.aprimore.dao;

import br.com.aprimore.config.Database;
import br.com.aprimore.model.Usuario;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Optional;

public class UsuarioDAO {
    public Optional<Usuario> buscarPorEmail(String email) throws SQLException {
        String sql = "SELECT id, nome, email, senha_hash, perfil FROM usuarios WHERE email = ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    return Optional.empty();
                }
                Usuario usuario = new Usuario(
                    result.getLong("id"),
                    result.getString("nome"),
                    result.getString("email"),
                    result.getString("perfil")
                );
                return Optional.of(new UsuarioComSenha(usuario, result.getString("senha_hash")).usuario());
            }
        }
    }

    public Optional<String> buscarHashSenha(String email) throws SQLException {
        String sql = "SELECT senha_hash FROM usuarios WHERE email = ?";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);
            try (ResultSet result = statement.executeQuery()) {
                return result.next() ? Optional.of(result.getString("senha_hash")) : Optional.empty();
            }
        }
    }

    public Usuario criar(String nome, String email, String senhaHash) throws SQLException {
        String sql = "INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, 'ALUNO')";
        try (Connection connection = Database.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, nome);
            statement.setString(2, email);
            statement.setString(3, senhaHash);
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (!keys.next()) {
                    throw new SQLException("Não foi possível recuperar o identificador do usuário criado.");
                }
                return new Usuario(keys.getLong(1), nome, email, "ALUNO");
            }
        }
    }

    private record UsuarioComSenha(Usuario usuario, String senhaHash) {
    }
}