package escola.tutorial;

import java.util.List;

/**
 * [O PROFESSOR - POOExplainer]
 * Este arquivo é o "Controle Remoto" que liga todos os tópicos.
 * Se você rodar este arquivo, verá a magia do POO acontecer no console!
 */
public class POOExplainer {
    
    public static void main(String[] args) {
        System.out.println("=================================================");
        System.out.println("   BEM-VINDO À GRANDE DEMONSTRAÇÃO DE POO       ");
        System.out.println("      (Feito para facilitar sua nota 10!)       ");
        System.out.println("=================================================\n");

        // [TÓPICO 1 & 2: CLASSES, OBJETOS E CONSTRUTORES]
        // Criamos dois heróis de verdade a partir do nosso molde.
        SuperHero h1 = new SuperHero("Bruce", "Java-Knight", 50, "Lógica");
        SuperHero h2 = new SuperHero("Diana", "Wonder-Code", 100, "Inclusão");

        // [TÓPICO 3: ENCAPSULAMENTO]
        System.out.println("[3] Encapsulamento: Nome do herói acessado via getter: " + h1.getHeroName());

        // [TÓPICO 4: HERANÇA]
        System.out.println("[4] Herança: h1 'é um' Hero (filho de Hero).");

        // [TÓPICO 8: INTERFACES]
        h1.activate(); // Ativando habilidade da interface Ability

        // [TÓPICO 5 & 7: POLIMORFISMO]
        // Criamos uma lista de 'Hero' (pai), mas colocamos 'SuperHero' (filho) dentro.
        // O Java é inteligente e sabe chamar o método do filho!
        List<Hero> academy = List.of(h1, h2);
        System.out.println("[7] Polimorfismo: Percorrendo a lista de heróis...");
        for (Hero h : academy) {
            // [TÓPICO 4: SOBRESCRITA]
            System.out.println("    - " + h.useSpecialPower());
        }

        // [TÓPICO 4: SOBRECARGA]
        System.out.println("[4] Sobrecarga: " + h1.attack() + " | " + h1.attack("Mouse Gamer"));

        // [TÓPICO 10: ENUM]
        PowerLevel level = PowerLevel.GOD_LEVEL;
        System.out.println("[10] Enum: Este curso é nível: " + level);

        // [TÓPICO 14: JDBC]
        HeroDAO dao = new HeroDAO();
        dao.init(); // Cria banco
        dao.saveHero(h2.getHeroName(), h2.getPowerLevel()); // Salva Diana

        // [TÓPICO 9: JAVA IO]
        HeroFiles.saveJournal(h2.getHeroName(), "Salvei o dia usando Polimorfismo!");

        // [TÓPICO 12 & 11: THREADS E EXCEÇÕES]
        HeroMission mission = new HeroMission("Missão de IA");
        mission.addHero(h1);
        mission.addHero(h2);
        mission.start(); // Roda em paralelo!

        // [TÓPICO 13: SWING]
        // Se você quiser ver a tela, descomente as duas linhas abaixo!
        // HeroAcademyUI ui = new HeroAcademyUI();
        // ui.showWindow();

        System.out.println("\n[AVISO] A missão está rodando em uma Thread ao fundo...");
        System.out.println("--- Fim da aula! Verifique os arquivos na pasta 'tutorial' ---");
    }
}
