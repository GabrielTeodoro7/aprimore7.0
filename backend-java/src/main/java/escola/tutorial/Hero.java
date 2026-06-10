package escola.tutorial;

/**
 * [TÓPICO 1: CLASSES E OBJETOS] 
 * Imagine que esta classe é a "Planta Baixa" ou o "Molde de Gesso" de um herói.
 * O Objeto é o herói de verdade que nasce a partir deste molde.
 * 
 * [TÓPICO 6: CLASSES ABSTRATAS]
 * Usamos 'abstract' porque não existe um herói "genérico". 
 * Você nunca viu o "Herói" na rua, você viu o "Batman" ou o "Superman".
 * A classe abstrata é uma ideia que precisa ser completada por alguém.
 */
public abstract class Hero {
    
    /**
     * [TÓPICO 3: ENCAPSULAMENTO]
     * Usamos 'private' para esconder os segredos! 
     * É como a identidade secreta: ninguém pode ver ou mexer direto no realName.
     * Só acessamos através de métodos "seguros" (Getters/Setters).
     */
    private String realName; // Identidade secreta (escondida)
    private String heroName; // Nome de herói (público via getter)
    private int powerLevel;  // Nível de força

    /**
     * [TÓPICO 2: CONSTRUTORES]
     * O construtor é o "Grito de Nascimento" do objeto.
     * Quando você faz 'new Hero(...)', este código roda para dar vida a ele.
     */
    public Hero(String realName, String heroName, int powerLevel) {
        this.realName = realName;
        this.heroName = heroName;
        this.powerLevel = powerLevel;
    }

    // --- GETTERS (ENCAPSULAMENTO) ---
    // Deixamos o mundo ver o nome de herói, mas não mudar!
    public String getHeroName() { return heroName; }
    public int getPowerLevel() { return powerLevel; }

    /**
     * [MÉTODO ABSTRATO]
     * Eu sei que TODO herói usa poder, mas não sei COMO.
     * Então eu digo: "Quem for meu filho, SE VIRE para explicar como usa o poder!"
     */
    public abstract String useSpecialPower();

    /**
     * [TÓPICO 4: SOBRESCRITA - @Override]
     * O Java já tem um método toString(), mas ele é feio.
     * Aqui nós "esmagamos" o original e fazemos o nosso bonitão.
     */
    @Override
    public String toString() {
        return "Herói: " + heroName + " | Força: " + powerLevel;
    }
}

