package escola.tutorial;

import java.util.List;

/**
 * [O QUE] O Grande Professor de POO
 * [POR QUE] Unir todos os conceitos em uma aula divertida.
 * [CONTEÚDO] Todos os 14 tópicos
 */
public class POOExplainer {
    
    public static void main(String[] args) {
        System.out.println("=== BEM-VINDO À AULA DE POO PARA SUPER-HERÓIS ===");
        System.out.println("Vou te mostrar os 14 segredos do Java!\n");

        // 1 e 2. Classes, Objetos e Construtores
        SuperHero h1 = new SuperHero("Bruce", "Bat-Java", 50, "Código");
        SuperHero h2 = new SuperHero("Clark", "Super-Try-Catch", 100, "Inclusão");

        // 3. Encapsulamento
        System.out.println("1 & 3. Criamos heróis e protegemos seus nomes reais: " + h1.getHeroName());

        // 4. Herança
        System.out.println("4. O " + h1.getHeroName() + " herdou tudo de 'Hero'!");

        // 5. Interface
        h1.activate(); // Usando método da interface Ability

        // 6. Classe Abstrata e 7. Polimorfismo
        // Tratamos todos como 'Hero', mas cada um age do seu jeito!
        List<Hero> academy = List.of(h1, h2);
        System.out.println("6 & 7. Polimorfismo em ação:");
        for (Hero h : academy) {
            System.out.println("  - " + h.useSpecialPower());
        }

        // 8. Coleções
        System.out.println("8. Usamos uma List para guardar os " + academy.size() + " heróis.");

        // 10. Enum
        PowerLevel level = PowerLevel.AVENGERS_LEVEL;
        System.out.println("10. Este herói é do nível: " + level);

        // 14. JDBC
        HeroDAO dao = new HeroDAO();
        dao.init();
        dao.saveHero(h1.getHeroName(), h1.getPowerLevel());

        // 9. Java IO
        HeroFiles.saveJournal(h1.getHeroName(), "Hoje aprendi a usar interfaces e foi incrível!");

        // 11 e 12. Threads e Exceções
        HeroMission mission = new HeroMission("Salvar o Semestre");
        mission.addHero(h1);
        mission.addHero(h2);
        mission.start(); // Começa em uma Thread separada!

        // 13. Swing (Comentado para não travar o console se não tiver tela, mas o código está lá!)
        // HeroAcademyUI ui = new HeroAcademyUI();
        // ui.showWindow();

        System.out.println("\n--- Fim da explicação básica! Olhe os arquivos na pasta 'tutorial' para aprender cada detalhe. ---");
    }
}
