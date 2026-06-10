package escola.service;

import escola.interfaces.Relatorio;
import escola.model.Aluno;

import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

// =====================================================================
// TÓPICO 13 — Substituição do Java Swing por GERAÇÃO DE PDF/RELATÓRIO
// Implementa a interface Relatorio gerando um PDF mínimo (PDF 1.4)
// escrito "à mão" — sem dependências externas.
//
// TÓPICO 5 — INTERFACES (implements Relatorio)
// TÓPICO 9 — JAVA IO    (FileOutputStream, BufferedWriter, Files)
// =====================================================================
public class RelatorioPDFService implements Relatorio {

    @Override
    public String getFormato() {
        return "PDF";
    }

    @Override
    public void gerar(List<Aluno> alunos, String caminhoSaida) throws IOException {
        // 1) Monta as linhas de texto do relatório
        List<String> linhas = new ArrayList<>();
        linhas.add("Relatorio de Alunos");
        linhas.add("Total: " + alunos.size());
        for (Aluno a : alunos) {
            linhas.add(String.format("- %s | mat:%s | media:%.2f",
                a.getNome(), a.getMatricula(), a.getNotaMedia()));
        }

        // 2) Gera um PDF mínimo válido (sem bibliotecas externas)
        StringBuilder conteudoStream = new StringBuilder();
        conteudoStream.append("BT /F1 12 Tf 50 770 Td 14 TL\n");
        for (String l : linhas) {
            conteudoStream.append("(").append(escapar(l)).append(") Tj T*\n");
        }
        conteudoStream.append("ET");

        String stream = conteudoStream.toString();
        StringBuilder pdf = new StringBuilder();
        pdf.append("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();

        offsets.add(pdf.length());
        pdf.append("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ")
           .append("/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("4 0 obj\n<< /Length ").append(stream.length()).append(" >>\nstream\n")
           .append(stream).append("\nendstream\nendobj\n");

        offsets.add(pdf.length());
        pdf.append("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

        int xrefPos = pdf.length();
        pdf.append("xref\n0 6\n0000000000 65535 f \n");
        for (int off : offsets) {
            pdf.append(String.format("%010d 00000 n \n", off));
        }
        pdf.append("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n")
           .append(xrefPos).append("\n%%EOF");

        // TÓPICO 9 — JAVA IO: escreve bytes no arquivo .pdf
        Files.write(Path.of(caminhoSaida), pdf.toString().getBytes(StandardCharsets.ISO_8859_1));

        // E também um .txt como log do relatório
        try (Writer w = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream(caminhoSaida + ".log"), StandardCharsets.UTF_8))) {
            for (String l : linhas) { w.write(l); w.write('\n'); }
        }
    }

    private String escapar(String s) {
        return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
