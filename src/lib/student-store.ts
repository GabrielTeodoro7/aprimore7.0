/**
 * student-store.ts — Onda B
 * --------------------------------------------------------------------------
 * `useSentimentos` e `useMedalhas` migradas para TanStack Query consumindo
 * server fns (sentimentos / conquistas). Para isso, precisamos do `alunos.id`
 * do usuário logado — exposto via `useMeuAluno()`.
 *
 * `useRotina` e `useAlunoPerfil` continuam em localStorage até a Onda C
 * (não há tabela equivalente no schema ainda).
 */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarSentimentos,
  registrarSentimento,
} from "@/lib/sentimentos.functions";
import {
  listarConquistas,
  concederConquista,
  removerConquista,
} from "@/lib/conquistas.functions";
import {
  getMeuAlunoPerfil,
  addEstrelas as addEstrelasFn,
} from "@/lib/alunoPerfil.functions";
import {
  listarRotina,
  upsertRotinaItem,
  concluirRotinaItem,
  removerRotinaItem,
  type RotinaRow,
} from "@/lib/rotina.functions";

export type Tone = "blue" | "green" | "orange" | "purple" | "pink" | "yellow";

/* =========================================================
 * useMeuAluno — descobre o aluno do usuário logado
 * ========================================================= */
export function useMeuAluno() {
  return useQuery({
    queryKey: ["meuAluno"],
    queryFn: () => getMeuAlunoPerfil(),
    staleTime: 60_000,
  });
}

/* =========================================================
 * Rotina (Onda C — backend)
 * ========================================================= */
export type RotinaItem = {
  id: string;
  hora: string;
  titulo: string;
  descricao: string;
  emoji: string;
  status: "concluida" | "pendente" | "bloqueada";
};

function mapRotina(r: RotinaRow): RotinaItem {
  return {
    id: r.id,
    hora: r.hora,
    titulo: r.titulo,
    descricao: r.descricao,
    emoji: r.emoji,
    status: r.status,
  };
}

export function useRotina() {
  const { data: meu } = useMeuAluno();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["rotina", { alunoId: meu?.id ?? null }],
    queryFn: () => listarRotina({ data: { alunoId: meu!.id } }),
    enabled: !!meu?.id,
    staleTime: 30_000,
  });

  const list = useMemo(() => data.map(mapRotina), [data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["rotina"] });

  const concluirMut = useMutation({
    mutationFn: (id: string) => concluirRotinaItem({ data: { id } }),
    onSuccess: invalidate,
  });
  const upsertMut = useMutation({
    mutationFn: (vars: Partial<RotinaItem> & { hora: string; titulo: string }) =>
      upsertRotinaItem({
        data: {
          id: vars.id,
          alunoId: meu?.id ?? "",
          hora: vars.hora,
          titulo: vars.titulo,
          descricao: vars.descricao ?? "",
          emoji: vars.emoji ?? "⭐",
          status: vars.status ?? "pendente",
          posicao: 0,
        },
      }),
    onSuccess: invalidate,
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => removerRotinaItem({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list,
    concluir: (id: string) => concluirMut.mutateAsync(id),
    upsert: (vars: Partial<RotinaItem> & { hora: string; titulo: string }) =>
      upsertMut.mutateAsync(vars),
    remove: (id: string) => removeMut.mutateAsync(id),
    total: list.length,
    concluidas: list.filter((r) => r.status === "concluida").length,
  };
}

export type AlunoPerfil = { nome: string; estrelas: number };
export function useAlunoPerfil() {
  const { data: meu } = useMeuAluno();
  const qc = useQueryClient();
  const perfil: AlunoPerfil = {
    nome: meu?.nome ?? "",
    estrelas: meu?.estrelas ?? 0,
  };
  const addMut = useMutation({
    mutationFn: (delta: number) =>
      addEstrelasFn({ data: { alunoId: meu!.id, delta } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meuAluno"] }),
  });
  return {
    perfil,
    addEstrelas: (n: number) => {
      if (!meu?.id) return Promise.resolve(undefined);
      return addMut.mutateAsync(n);
    },
    update: (_patch: Partial<AlunoPerfil>) => {
      // nome do aluno é editável via gestão de turma; estrelas via addEstrelas.
      return Promise.resolve();
    },
  };
}

/* =========================================================
 * useMedalhas — backed por `conquistas`
 * ========================================================= */
export type Medalha = {
  id: string;
  nome: string;
  emoji: string;
  tone: Tone;
  conquistada: boolean;
  descricao: string;
};

const TONES: Tone[] = ["blue", "green", "orange", "purple", "pink", "yellow"];
function toneFromIndex(i: number): Tone {
  return TONES[i % TONES.length];
}

export function useMedalhas() {
  const { data: meu } = useMeuAluno();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["conquistas", { alunoId: meu?.id ?? null }],
    queryFn: () =>
      listarConquistas({ data: meu?.id ? { alunoId: meu.id } : {} }),
    enabled: !!meu?.id,
    staleTime: 30_000,
  });

  const list: Medalha[] = useMemo(
    () =>
      data.map((c, i) => ({
        id: c.id,
        nome: c.titulo,
        emoji: c.emoji ?? "🏆",
        tone: toneFromIndex(i),
        conquistada: true,
        descricao: c.descricao ?? "",
      })),
    [data],
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ["conquistas"] });

  const conceder = useMutation({
    mutationFn: (vars: {
      tipo: string;
      titulo: string;
      descricao?: string;
      emoji?: string;
    }) =>
      concederConquista({
        data: { alunoId: meu?.id ?? "", ...vars },
      }),
    onSuccess: invalidate,
  });

  const remover = useMutation({
    mutationFn: (id: string) => removerConquista({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list,
    conceder: conceder.mutateAsync,
    remover: remover.mutateAsync,
  };
}

/* =========================================================
 * useSentimentos — backed por `sentimentos`
 * ========================================================= */
export type RegistroSentimento = {
  id: string;
  sentimento: string;
  emoji: string;
  data: string;
};

export function useSentimentos() {
  const { data: meu } = useMeuAluno();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["sentimentos", { alunoId: meu?.id ?? null }],
    queryFn: () =>
      listarSentimentos({
        data: { alunoId: meu?.id, limit: 30 },
      }),
    enabled: !!meu?.id,
    staleTime: 15_000,
  });

  const list: RegistroSentimento[] = useMemo(
    () =>
      data.map((r) => ({
        id: r.id,
        sentimento: r.emocao,
        emoji: r.emoji ?? "🙂",
        data: new Date(r.created_at).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }),
      })),
    [data],
  );

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sentimentos"] });

  const registrarMut = useMutation({
    mutationFn: (vars: { sentimento: string; emoji: string; nota?: string }) =>
      registrarSentimento({
        data: {
          alunoId: meu?.id ?? "",
          emocao: vars.sentimento,
          emoji: vars.emoji,
          nota: vars.nota,
        },
      }),
    onSuccess: invalidate,
  });

  return {
    list,
    registrar: async (sentimento: string, emoji: string, nota?: string) => {
      if (!meu?.id) {
        console.warn("[sentimentos] aluno não encontrado p/ usuário logado");
        return;
      }
      await registrarMut.mutateAsync({ sentimento, emoji, nota });
    },
  };
}

/* =========================================================
 * Catálogos estáticos (UI-only — não vão para o backend)
 * ========================================================= */
export const sentimentosCatalogo = [
  { id: "feliz", label: "Feliz", emoji: "😊", tone: "yellow" as Tone },
  { id: "triste", label: "Triste", emoji: "😢", tone: "blue" as Tone },
  { id: "bravo", label: "Bravo", emoji: "😠", tone: "pink" as Tone },
  { id: "preocupado", label: "Preocupado", emoji: "😟", tone: "purple" as Tone },
  { id: "medo", label: "Com medo", emoji: "😨", tone: "orange" as Tone },
  { id: "surpreso", label: "Surpreso", emoji: "😮", tone: "blue" as Tone },
  { id: "calmo", label: "Calmo", emoji: "😌", tone: "green" as Tone },
  { id: "cansado", label: "Cansado", emoji: "😴", tone: "purple" as Tone },
  { id: "carinho", label: "Com carinho", emoji: "🥰", tone: "pink" as Tone },
];

export const pictogramas = {
  Sentimentos: [
    { id: "feliz", label: "Feliz", emoji: "😊" },
    { id: "triste", label: "Triste", emoji: "😢" },
    { id: "bravo", label: "Bravo", emoji: "😠" },
    { id: "preocupado", label: "Preocupado", emoji: "😟" },
    { id: "medo", label: "Com medo", emoji: "😨" },
    { id: "surpreso", label: "Surpreso", emoji: "😮" },
    { id: "calmo", label: "Calmo", emoji: "😌" },
    { id: "cansado", label: "Cansado", emoji: "😴" },
    { id: "carinho", label: "Com carinho", emoji: "🥰" },
  ],
  Necessidades: [
    { id: "agua", label: "água", emoji: "💧" },
    { id: "banheiro", label: "banheiro", emoji: "🚻" },
    { id: "comida", label: "comida", emoji: "🍽️" },
    { id: "descanso", label: "descansar", emoji: "🛏️" },
    { id: "ajuda", label: "ajuda", emoji: "🆘" },
    { id: "remedio", label: "remédio", emoji: "💊" },
  ],
  Ações: [
    { id: "quero", label: "quero", emoji: "✋" },
    { id: "nao-quero", label: "não quero", emoji: "🙅" },
    { id: "ir", label: "ir", emoji: "🚶" },
    { id: "ver", label: "ver", emoji: "👀" },
    { id: "ouvir", label: "ouvir", emoji: "👂" },
    { id: "brincar", label: "brincar", emoji: "🧩" },
  ],
  Lugares: [
    { id: "casa", label: "casa", emoji: "🏠" },
    { id: "escola", label: "escola", emoji: "🏫" },
    { id: "parque", label: "parque", emoji: "🌳" },
    { id: "sala", label: "sala", emoji: "🚪" },
    { id: "banheiro-l", label: "banheiro", emoji: "🚽" },
    { id: "patio", label: "pátio", emoji: "⛲" },
  ],
  Pessoas: [
    { id: "eu", label: "Eu", emoji: "🙋" },
    { id: "mamae", label: "mamãe", emoji: "👩" },
    { id: "papai", label: "papai", emoji: "👨" },
    { id: "professor", label: "professor(a)", emoji: "🧑‍🏫" },
    { id: "amigo", label: "amigo", emoji: "🧒" },
  ],
  Alimentos: [
    { id: "pao", label: "pão", emoji: "🥖" },
    { id: "fruta", label: "fruta", emoji: "🍎" },
    { id: "suco", label: "suco", emoji: "🧃" },
    { id: "leite", label: "leite", emoji: "🥛" },
    { id: "biscoito", label: "biscoito", emoji: "🍪" },
  ],
  Cortesia: [
    { id: "por-favor", label: "por favor", emoji: "🙏" },
    { id: "obrigado", label: "obrigado", emoji: "💖" },
    { id: "oi", label: "oi", emoji: "👋" },
    { id: "tchau", label: "tchau", emoji: "👋" },
  ],
};
export type PictoCategoria = keyof typeof pictogramas;
