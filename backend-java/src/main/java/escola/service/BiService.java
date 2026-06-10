package escola.service;

import escola.model.BiData;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * RN.65-70: Processamento analítico de dados educacionais.
 * Conteúdo Acadêmico: Java Streams e Coleções.
 */
public class BiService {
    private List<BiData> historicoConsolidado;

    public BiService() {
        this.historicoConsolidado = new ArrayList<>();
    }

    /**
     * RN.66: Filtra consolidados por referência mensal.
     */
    public List<BiData> filtrarPorMes(String mesAno) {
        return historicoConsolidado.stream()
            .filter(d -> d.getReferencia().equals(mesAno))
            .collect(Collectors.toList());
    }

    public void adicionarConsolidado(BiData data) {
        this.historicoConsolidado.add(data);
    }
}
