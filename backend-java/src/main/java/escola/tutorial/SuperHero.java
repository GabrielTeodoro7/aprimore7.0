package escola.tutorial;

/**
 * [O QUE] Herança, Polimorfismo e Sobrecarga
 * [POR QUE] Criar um herói de verdade baseado na base 'Hero'.
 * [CONTEÚDO] Inheritance, Polymorphism, Overloading, Overriding
 */
public class SuperHero extends Hero implements Ability {
    private String element;

    // Construtor chamando o pai (super)
    public SuperHero(String realName, String heroName, int powerLevel, String element) {
        super(realName, heroName, powerLevel);
        this.element = element;
    }

    // Sobrescrita (Overriding): Dando vida ao método abstrato do pai
    @Override
    public String useSpecialPower() {
        return getHeroName() + " está usando o poder do " + element + "!";
    }

    // Sobrecarga (Overloading): O mesmo método com "temperos" diferentes
    public String attack() {
        return getHeroName() + " deu um soco comum!";
    }

    public String attack(String weapon) {
        return getHeroName() + " atacou usando " + weapon + "!";
    }

    // Implementando a Interface Ability
    @Override
    public void activate() {
        System.out.println("Habilidade de " + element + " ativada!");
    }

    @Override
    public String getDescription() {
        return "Controla o elemento " + element;
    }
}
