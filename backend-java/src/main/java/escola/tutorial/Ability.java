package escola.tutorial;

/**
 * [O QUE] Interface
 * [POR QUE] Define o que um herói PODE fazer (um contrato).
 * [CONTEÚDO] Interfaces
 * 
 * Uma interface é como uma lista de regras: "Se você quer ser voador, 
 * você TEM que saber voar e pousar".
 */
public interface Ability {
    void activate();
    String getDescription();
}
