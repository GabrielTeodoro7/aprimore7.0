package escola.tutorial;

/**
 * [O QUE] Classe Abstrata e Encapsulamento
 * [POR QUE] Uma base para todos os heróis, guardando segredos (private).
 * [CONTEÚDO] Abstract Classes, Encapsulation
 * 
 * Imagine que um Herói é como um desenho que ainda não terminou. 
 * Você sabe que ele tem nome e poder, mas não sabe como ele age ainda.
 */
public abstract class Hero {
    // Encapsulamento: Protegendo o nome real do herói!
    // Ninguém pode mudar o nome sem permissão.
    private String realName;
    private String heroName;
    private int powerLevel;

    // Construtor: O momento em que o herói nasce!
    public Hero(String realName, String heroName, int powerLevel) {
        this.realName = realName;
        this.heroName = heroName;
        this.powerLevel = powerLevel;
    }

    // Getters e Setters (Encapsulamento)
    public String getHeroName() {
        return heroName;
    }

    public int getPowerLevel() {
        return powerLevel;
    }

    // Método Abstrato: Todo herói DEVE saber usar seu poder, 
    // mas cada um faz de um jeito diferente!
    public abstract String useSpecialPower();

    // Sobrescrita: Todos os heróis sabem se apresentar
    @Override
    public String toString() {
        return "Sou o " + heroName + " (Nível: " + powerLevel + ")";
    }
}
