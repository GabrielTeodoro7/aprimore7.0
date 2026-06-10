package escola.tutorial;

/**
 * [TÓPICO 4: HERANÇA - 'extends']
 * O SuperHero é um "Filho" da classe Hero. 
 * Ele já nasce sabendo tudo o que o pai (Hero) sabe, mas ganha coisas novas!
 */
public class SuperHero extends Hero implements Ability {
    
    private String element; // Ex: Fogo, Água, Código

    /**
     * [CONSTRUTOR E 'super']
     * Usamos 'super' para falar com o pai. 
     * É como dizer: "Pai, cuida do nome e da força, que eu cuido do meu Elemento!"
     */
    public SuperHero(String realName, String heroName, int powerLevel, String element) {
        super(realName, heroName, powerLevel); // Chama o construtor do pai
        this.element = element;
    }

    /**
     * [TÓPICO 4: SOBRESCRITA - 'Override']
     * Lembra que o pai disse que todo herói usa poder mas não sabia como?
     * Aqui nós damos a resposta final!
     */
    @Override
    public String useSpecialPower() {
        return "SUPER PODER: " + getHeroName() + " controla o elemento " + element + "!";
    }

    /**
     * [TÓPICO 4: SOBRECARGA - 'Overloading']
     * É quando o herói tem o mesmo golpe, mas com intensidades diferentes.
     * Mesmos nomes, mas "ingredientes" (parâmetros) diferentes.
     */
    public String attack() { // Soco normal
        return getHeroName() + " deu um soco comum!";
    }

    public String attack(String weapon) { // Soco com acessório
        return getHeroName() + " atacou usando o poder de: " + weapon + "!";
    }

    /**
     * [TÓPICO 8: INTERFACES - Implementação]
     * Estamos cumprindo a promessa que fizemos para a Interface Ability.
     */
    @Override
    public void activate() {
        System.out.println("[Ability] Sistema de " + element + " carregado 100%!");
    }

    @Override
    public String getDescription() {
        return "Especialista em manipulação de " + element;
    }
}

