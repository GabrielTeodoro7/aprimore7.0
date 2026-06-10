package escola.service;

import escola.model.AnomaliaAcesso;

import java.time.Instant;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

// =============================================================================
// AnomaliaService — Heurística simples de detecção de anomalia (RN.61).
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   * Mantém, para cada usuário, um perfil (último país, último UA, último IP).
//   * Cada login passa pelo `analisar()`. Se algo destoa do perfil, devolve
//     uma instância de AnomaliaAcesso. Caso contrário, devolve null.
//
// POR QUE FOI UTILIZADO:
//   * Permite gerar evento sem depender de ML; serve de baseline.
//
// QUANDO UTILIZAR:
//   * Ao final de toda tentativa de login bem-sucedida.
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Coleções (HashMap).
//   - Enum (AnomaliaAcesso.Tipo, .Gravidade).
//   - Encapsulamento (perfil interno privado).
//   - Tratamento de datas (LocalTime).
// =============================================================================
public class AnomaliaService {

    // Perfil mínimo guardado por usuário.
    // CONTEÚDO ACADÊMICO: classe interna estática (Encapsulamento).
    private static class Perfil {
        String ultimoPais;
        String ultimoUA;
    }

    private final Map<UUID, Perfil> perfis = new HashMap<>();
    private final ZoneId zona = ZoneId.of("America/Sao_Paulo");

    public AnomaliaAcesso analisar(UUID userId, String ip, String ua,
                                   String pais, String cidade) {
        Perfil p = perfis.computeIfAbsent(userId, k -> new Perfil());

        AnomaliaAcesso.Tipo tipo = null;
        AnomaliaAcesso.Gravidade grav = AnomaliaAcesso.Gravidade.BAIXA;

        if (p.ultimoPais != null && pais != null && !pais.equalsIgnoreCase(p.ultimoPais)) {
            tipo = AnomaliaAcesso.Tipo.NOVO_PAIS;
            grav = AnomaliaAcesso.Gravidade.ALTA;
        } else if (p.ultimoUA != null && ua != null && !ua.equals(p.ultimoUA)) {
            tipo = AnomaliaAcesso.Tipo.NOVO_DISPOSITIVO;
            grav = AnomaliaAcesso.Gravidade.MEDIA;
        } else {
            // horário fora de 6h–23h é considerado atípico.
            LocalTime hora = LocalTime.now(zona);
            if (hora.isBefore(LocalTime.of(6, 0)) || hora.isAfter(LocalTime.of(23, 0))) {
                tipo = AnomaliaAcesso.Tipo.HORARIO_ATIPICO;
                grav = AnomaliaAcesso.Gravidade.BAIXA;
            }
        }

        // Atualiza perfil sempre (aprendizado online simples).
        p.ultimoPais = pais != null ? pais : p.ultimoPais;
        p.ultimoUA   = ua   != null ? ua   : p.ultimoUA;

        if (tipo == null) return null;
        return new AnomaliaAcesso(UUID.randomUUID(), userId, tipo, grav,
                                  ip, ua, pais, cidade, false, false, Instant.now());
    }
}
