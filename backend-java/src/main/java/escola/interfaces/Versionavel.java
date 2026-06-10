package escola.interfaces;

// =============================================================================
// Versionavel — Entidades que participam de controle otimista de versão.
// -----------------------------------------------------------------------------
// O QUE FAZ:
//   Define o contrato mínimo para uma entidade que carrega um número de
//   versão incrementado a cada UPDATE. Usado pelo `Versionador` (Onda C.2)
//   para resolver conflitos de edição simultânea (RN.50).
//
// POR QUE FOI UTILIZADO:
//   Permite escrever serviços que aceitem QUALQUER entidade versionada,
//   sem precisar conhecer o tipo concreto. É o coração do Polimorfismo
//   estrutural em Java.
//
// QUANDO UTILIZAR:
//   Em todo modelo que pode ser editado concorrentemente (alunos, notas,
//   avaliações, PDIs).
//
// CONTEÚDOS ACADÊMICOS DEMONSTRADOS:
//   - Interfaces (contrato sem implementação).
//   - Polimorfismo (qualquer Versionavel é tratável como o mesmo tipo).
// =============================================================================

public interface Versionavel {
    // Retorna a versão atual da entidade (>= 0).
    int getVersao();

    // Incrementa a versão. Implementação concreta decide se imutável ou mutável.
    void incrementarVersao();
}
