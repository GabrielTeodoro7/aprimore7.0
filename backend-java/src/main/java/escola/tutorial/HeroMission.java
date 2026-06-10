package escola.tutorial;

import java.util.ArrayList;
import java.util.List;

/**
 * [TÓPICO 12: THREADS]
 * Uma Thread é como um "Clone" do seu programa que faz outra coisa ao mesmo tempo.
 * Enquanto o programa principal atende o usuário, esta Thread faz a missão rodar no fundo.
 */
public class HeroMission extends Thread {
    private String missionName;
    
    /**
     * [TÓPICO 8: COLEÇÕES DO JAVA - 'List']
     * Usamos List (ArrayList) para guardar vários heróis juntos.
     * É muito melhor que Array comum porque ela cresce sozinha!
     */
    private List<SuperHero> team = new ArrayList<>();

    public HeroMission(String missionName) {
        this.missionName = missionName;
    }

    public void addHero(SuperHero hero) {
        team.add(hero);
    }

    /**
     * [O CORAÇÃO DA THREAD]
     * Tudo o que você colocar dentro do run() vai rodar "em paralelo".
     */
    @Override
    public void run() {
        System.out.println("\n[THREAD] Iniciando missão paralela: " + missionName);
        try {
            for (SuperHero hero : team) {
                System.out.println("  > " + hero.getHeroName() + " está lutando...");
                
                // Faz a thread "dormir" por 1 segundo (simula tempo de luta)
                Thread.sleep(1000); 

                /**
                 * [TÓPICO 11: EXCEÇÕES DO JAVA]
                 * Se o nível de poder for muito baixo (menos de 10), 
                 * nós "gritamos" um erro usando 'throw'.
                 */
                if (hero.getPowerLevel() < 10) {
                    throw new MissionFailedException("Nível insuficiente para esta missão!");
                }
            }
            System.out.println("[THREAD] Missão " + missionName + " vencida!\n");
            
        } catch (InterruptedException e) {
            System.err.println("A missão foi interrompida bruscamente!");
        } catch (MissionFailedException e) {
            /**
             * [TRATAMENTO DE EXCEÇÃO]
             * Usamos o 'catch' para capturar o erro e não deixar o programa "morrer".
             */
            System.err.println("[AVISO] Falha na Missão: " + e.getMessage());
        }
    }
}

/**
 * [MINHA PRÓPRIA EXCEÇÃO]
 * Criamos uma classe que herda de Exception para ter erros personalizados.
 */
class MissionFailedException extends Exception {
    public MissionFailedException(String message) {
        super(message);
    }
}

