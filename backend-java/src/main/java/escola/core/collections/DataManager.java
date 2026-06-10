package escola.core.collections;

import java.util.*;
import java.util.stream.Collectors;

/**
 * [COLEÇÕES E POLIMORFISMO]
 * Gerenciador genérico que demonstra o uso de Streams e Collections.
 */
public class DataManager<T> {
    private final List<T> data = new ArrayList<>();

    public void add(T item) {
        data.add(item);
    }

    /**
     * [POLIMORFISMO / JAVA 8+]
     * Retorna uma visão imutável da coleção.
     */
    public List<T> getAll() {
        return Collections.unmodifiableList(data);
    }

    public List<T> filter(java.util.function.Predicate<T> criteria) {
        return data.stream().filter(criteria).collect(Collectors.toList());
    }
}
