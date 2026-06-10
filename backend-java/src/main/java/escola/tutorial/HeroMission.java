package escola.tutorial;

import java.util.ArrayList;
import java.util.List;

/**
 * [O QUE] Threads, Coleções e Exceções
 * [POR QUE] Rodar várias missões ao mesmo tempo e guardar os heróis em uma lista.
 * [CONTEÚDO] Thread, Collections, Exceptions
 */
public class HeroMission extends Thread {
    private String missionName;
    private List<SuperHero> team = new ArrayList<>(); // Coleções (List)

    public HeroMission(String missionName) {
        this.missionName = missionName;
    }

    public void addHero(SuperHero hero) {
        team.add(hero);
    }

    // Método run() da Thread: O que acontece quando a missão começa?
    @Override
    public void run() {
        System.out.println(">>> Missão " + missionName + " INICIADA em uma nova Thread!");
        try {
            for (SuperHero hero : team) {
                System.out.println("Herói " + hero.getHeroName() + " entrando em ação...");
                Thread.sleep(1000); // Espera 1 segundo (como se estivesse lutando)
                
                // Exceção: Se o nível for baixo demais, a missão falha!
                if (hero.getPowerLevel() < 10) {
                    throw new MissionFailedException("Herói " + hero.getHeroName() + " é muito fraco!");
                }
            }
            System.out.println("<<< Missão " + missionName + " COMPLETADA com sucesso!");
        } catch (InterruptedException e) {
            System.err.println("Missão interrompida!");
        } catch (MissionFailedException e) {
            System.err.println("ERRO NA MISSÃO: " + e.getMessage());
        }
    }
}

// Classe de Exceção Customizada
class MissionFailedException extends Exception {
    public MissionFailedException(String message) {
        super(message);
    }
}
