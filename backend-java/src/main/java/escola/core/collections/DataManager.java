package escola.core.collections;

import java.util.*;
import java.util.stream.Collectors;

/**
 * =================================================================================================
 * TÓPICO 9 — COLEÇÕES DO JAVA (Collections Framework)
 * =================================================================================================
 * O Java Collections permite armazenar e manipular grupos de objetos. Aqui usamos 'ArrayList',
 * que é uma lista redimensionável dinamicamente (diferente dos arrays comuns do Java).
 * 
 * TÓPICO 7 — CLASSES E OBJETOS (Generics)
 * Usamos Generics '<T>' para que esta classe possa gerenciar QUALQUER tipo de dado de forma segura.
 * =================================================================================================
 */
public class DataManager<T> {
    
    // TÓPICO 9 — COLEÇÕES: ArrayList é a implementação mais comum da interface 'List'.
    private final List<T> data = new ArrayList<>();

    public void add(T item) {
        data.add(item);
    }

    /**
     * Retorna uma visão imutável da coleção.
     * TÓPICO 3 — ENCAPSULAMENTO: Protegemos a lista interna para que ninguém a limpe sem permissão.
     */
    public List<T> getAll() {
        return Collections.unmodifiableList(data);
    }

    /**
     * TÓPICO 7 — POLIMORFISMO / JAVA 8 (Streams)
     * Demonstração de Streams e Predicates para filtrar dados de forma funcional e moderna.
     */
    public List<T> filter(java.util.function.Predicate<T> criteria) {
        return data.stream().filter(criteria).collect(Collectors.toList());
    }
}
