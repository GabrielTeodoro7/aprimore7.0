package escola.service;

import escola.interfaces.Relatorio;
import escola.model.Aluno;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

// Outra implementação de Relatorio (reforça polimorfismo via interface).
public class RelatorioCSVService implements Relatorio {

    @Override public String getFormato() { return "CSV"; }

    @Override
    public void gerar(List<Aluno> alunos, String caminhoSaida) throws IOException {
        try (BufferedWriter w = Files.newBufferedWriter(Path.of(caminhoSaida), StandardCharsets.UTF_8)) {
            w.write("nome;cpf;matricula;nota_media\n");
            for (Aluno a : alunos) {
                w.write(String.format("%s;%s;%s;%.2f%n",
                    a.getNome(), a.getCpf(), a.getMatricula(), a.getNotaMedia()));
            }
        }
    }
}
