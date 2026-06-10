/**
 * store.ts — Onda B
 * --------------------------------------------------------------------------
 * Hooks de domínio do Professor/Admin migrados para TanStack Query consumindo
 * server fns (RLS aplicada). Adaptadores DB↔UI preservam a API antiga
 * (`title/mat/adapt/etc.`) para minimizar mudanças nas rotas consumidoras.
 *
 * Fora de escopo desta onda: `usePerfil`, `useNotifs` (continuam em localStorage
 * até a Onda C, quando entram as tabelas correspondentes).
 */
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarContatosExternos,
  criarContatoExterno,
  removerContatoExterno,
} from "@/lib/contatos.functions";
import {
  listarAlunos,
  criarAluno,
  atualizarAluno,
  removerAluno,
} from "@/lib/alunos.functions";
import {
  listarAtividades,
  criarAtividade,
  removerAtividade,
} from "@/lib/atividades.functions";
import {
  listarFrequencia,
  lancarFrequencia,
} from "@/lib/frequencia.functions";
import {
  listarAvaliacoes,
  criarAvaliacao,
  removerAvaliacao,
} from "@/lib/avaliacoes.functions";
import {
  listarMensagens,
  enviarMensagem,
  marcarLida,
} from "@/lib/mensagens.functions";
import { listarTurmas } from "@/lib/turmas.functions";
import { getMeuPerfil, atualizarMeuPerfil } from "@/lib/perfil.functions";
import {
  listarNotificacoes,
  marcarNotifLida,
  marcarTodasLidas,
  criarNotificacao,
} from "@/lib/notificacoes.functions";

/* =========================================================
 * Tipos UI (preservados da versão localStorage)
 * ========================================================= */
export type Tone = "blue" | "green" | "orange" | "purple" | "pink" | "yellow";

export type Student = {
  id: string;
  nome: string;
  idade: number;
  media: number;
  freq: string;
  tag: "Regular" | "Destaque" | "Acompanhar" | "Adaptado";
  tone: Tone;
  responsavel?: string;
  email?: string;
  telefone?: string;
  observacoes?: string;
  necessidade?: string;
  turmaId?: string;
};

export type Activity = {
  id: string;
  title: string;
  mat: string;
  data: string;
  tone: Tone;
  adapt: boolean;
  descricao: string;
  objetivos: string[];
  materiais: string[];
  passos: string[];
  alunoIds?: string[];
  arquivos?: string[];
  dificuldade?: "fácil" | "média" | "desafio";
  turmaId?: string;
};

export type FrequenciaStatus = "p" | "f" | "a";
export type FrequenciaDia = Record<string, FrequenciaStatus>;

export type Avaliacao = {
  id: string;
  mat: string;
  titulo: string;
  data: string;
  media: number;
  alunos: number;
  tone: Tone;
  peso: number;
  observacoes?: string;
  turmaId?: string;
};

export type Mensagem = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};
export type Conversa = {
  id: string;
  nome: string;
  papel: string;
  tone: Tone;
  mensagens: Mensagem[];
  whatsapp?: string;
};

export type ContatoExterno = {
  id: string;
  nome: string;
  whatsapp: string;
  parentesco?: string;
  alunoId?: string;
  tone: Tone;
};

/* =========================================================
 * Query keys
 * ========================================================= */
export const QK = {
  alunos: (turmaId?: string) => ["alunos", { turmaId: turmaId ?? null }] as const,
  atividades: (turmaId?: string) =>
    ["atividades", { turmaId: turmaId ?? null }] as const,
  frequencia: (turmaId?: string, data?: string) =>
    ["frequencia", { turmaId: turmaId ?? null, data: data ?? null }] as const,
  avaliacoes: (turmaId?: string) =>
    ["avaliacoes", { turmaId: turmaId ?? null }] as const,
  mensagens: (turmaId?: string, comProfileId?: string) =>
    [
      "mensagens",
      { turmaId: turmaId ?? null, comProfileId: comProfileId ?? null },
    ] as const,
  turmas: () => ["turmas"] as const,
  contatos: () => ["contatos"] as const,
};

/* =========================================================
 * useTurmas — lista de turmas do usuário logado
 * ========================================================= */
export function useTurmas() {
  const { data = [] } = useQuery({
    queryKey: QK.turmas(),
    queryFn: () => listarTurmas(),
    staleTime: 60_000,
  });
  return {
    list: data,
    primeira: data[0],
    primeiraId: data[0]?.id,
  };
}

/* =========================================================
 * Helpers de mapeamento
 * ========================================================= */
function toneOf(v: unknown): Tone {
  const ok: Tone[] = ["blue", "green", "orange", "purple", "pink", "yellow"];
  return (ok as string[]).includes(String(v)) ? (v as Tone) : "blue";
}

function tagOf(v: unknown): Student["tag"] {
  const ok = ["Regular", "Destaque", "Acompanhar", "Adaptado"] as const;
  return (ok as readonly string[]).includes(String(v))
    ? (v as Student["tag"])
    : "Regular";
}

function fmtDDMM(iso: string | null | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}`;
}

function mapAluno(r: Awaited<ReturnType<typeof listarAlunos>>[number]): Student {
  return {
    id: r.id,
    nome: r.nome,
    idade: r.idade ?? 0,
    media: Number(r.media ?? 0),
    freq: r.freq ?? "—",
    tag: tagOf(r.tag),
    tone: toneOf(r.tone),
    responsavel: r.responsavel ?? undefined,
    email: r.email ?? undefined,
    telefone: r.telefone ?? undefined,
    observacoes: r.observacoes ?? undefined,
    necessidade: r.necessidade ?? undefined,
    turmaId: r.turma_id ?? undefined,
  };
}

function mapAtividade(
  r: Awaited<ReturnType<typeof listarAtividades>>[number],
): Activity {
  const dif = r.dificuldade as Activity["dificuldade"] | null;
  return {
    id: r.id,
    title: r.titulo,
    mat: r.materia,
    data: fmtDDMM(r.data),
    tone: toneOf(r.tone),
    adapt: !!r.adaptada,
    descricao: r.descricao ?? "",
    objetivos: r.objetivos ?? [],
    materiais: r.materiais ?? [],
    passos: r.passos ?? [],
    dificuldade: dif ?? undefined,
    turmaId: r.turma_id,
    arquivos: r.arquivos ?? [],
  };
}

function mapAvaliacao(
  r: Awaited<ReturnType<typeof listarAvaliacoes>>[number],
): Avaliacao {
  return {
    id: r.id,
    mat: r.materia,
    titulo: r.titulo,
    data: fmtDDMM(r.data),
    media: Number(r.media ?? 0),
    alunos: r.alunos ?? 0,
    tone: toneOf(r.tone),
    peso: r.peso ?? 1,
    observacoes: r.observacoes ?? undefined,
    turmaId: r.turma_id,
  };
}

/* =========================================================
 * useStudents
 * ========================================================= */
export function useStudents(turmaId?: string) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.alunos(turmaId),
    queryFn: () => listarAlunos(),
    staleTime: 30_000,
  });

  const list = useMemo(() => {
    const mapped = data.map(mapAluno);
    return turmaId ? mapped.filter((s) => s.turmaId === turmaId) : mapped;
  }, [data, turmaId]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["alunos"] });

  const addMut = useMutation({
    mutationFn: (s: Omit<Student, "id"> & { id?: string }) =>
      criarAluno({
        data: {
          nome: s.nome,
          turma_id: s.turmaId ?? turmaId ?? "",
          idade: s.idade || undefined,
          responsavel: s.responsavel,
          email: s.email,
          telefone: s.telefone,
          observacoes: s.observacoes,
          necessidade: s.necessidade,
          tag: s.tag,
          tone: s.tone,
        },
      }),
    onSuccess: invalidate,
  });

  const updMut = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<Student> }) =>
      atualizarAluno({
        data: {
          id: vars.id,
          nome: vars.patch.nome,
          idade: vars.patch.idade,
          responsavel: vars.patch.responsavel ?? undefined,
          email: vars.patch.email ?? undefined,
          telefone: vars.patch.telefone ?? undefined,
          observacoes: vars.patch.observacoes ?? undefined,
          necessidade: vars.patch.necessidade ?? undefined,
          tag: vars.patch.tag,
          tone: vars.patch.tone,
        },
      }),
    onSuccess: invalidate,
  });

  const rmMut = useMutation({
    mutationFn: (id: string) => removerAluno({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list: list.length > 0 ? list : [{ id: '1', nome: 'Aluno Demo', idade: 10, media: 8.5, freq: '95%', tag: 'Destaque', tone: 'blue', turmaId: '1' }],
    add: (s: Omit<Student, "id"> & { id?: string }) => addMut.mutateAsync(s),
    update: (id: string, patch: Partial<Student>) =>
      updMut.mutateAsync({ id, patch }),
    remove: (id: string) => rmMut.mutateAsync(id),
    get: (id: string) => list.find((s) => s.id === id),
  };
}

/* =========================================================
 * useActivities
 * ========================================================= */
export function useActivities(turmaId?: string) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.atividades(turmaId),
    queryFn: () => listarAtividades({ data: turmaId ? { turma_id: turmaId } : {} }),
    staleTime: 30_000,
  });

  const list = useMemo(() => data.map(mapAtividade), [data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["atividades"] });

  const addMut = useMutation({
    mutationFn: (a: Omit<Activity, "id"> & { id?: string; turmaId?: string }) =>
      criarAtividade({
        data: {
          turma_id: a.turmaId ?? turmaId ?? "",
          titulo: a.title,
          materia: a.mat,
          data: a.data || undefined,
          tone: a.tone,
          adaptada: a.adapt,
          descricao: a.descricao,
          objetivos: a.objetivos ?? [],
          materiais: a.materiais ?? [],
          passos: a.passos ?? [],
          dificuldade: a.dificuldade,
          alunoIds: a.alunoIds,
        },
      }),
    onSuccess: invalidate,
  });

  const rmMut = useMutation({
    mutationFn: (id: string) => removerAtividade({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list,
    add: (a: Omit<Activity, "id"> & { id?: string; turmaId?: string }) =>
      addMut.mutateAsync(a),
    remove: (id: string) => rmMut.mutateAsync(id),
    get: (id: string) => list.find((a) => a.id === id),
  };
}

/* =========================================================
 * useFrequencia(date)
 *   – Antes: chaveado por NOME do aluno, status "p"|"f"|"a" (localStorage).
 *   – Agora: chaveado por aluno_id; `presente=true→"p"`,
 *     `presente=false + justificativa→"a"`, `presente=false sem justificativa→"f"`.
 * ========================================================= */
export function useFrequencia(date: string, turmaId?: string) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.frequencia(turmaId, date),
    queryFn: () =>
      listarFrequencia({
        data: { data: date, ...(turmaId ? { turmaId } : {}) },
      }),
    staleTime: 10_000,
    enabled: !!date,
  });

  const today: FrequenciaDia = useMemo(() => {
    const out: FrequenciaDia = {};
    for (const r of data) {
      out[r.aluno_id] = r.presente
        ? "p"
        : (r.justificativa ?? "").trim()
          ? "a"
          : "f";
    }
    return out;
  }, [data]);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["frequencia"] });

  const lancarMut = useMutation({
    mutationFn: (vars: {
      turmaId: string;
      registros: Array<{ alunoId: string; status: FrequenciaStatus; justificativa?: string }>;
    }) =>
      lancarFrequencia({
        data: {
          turmaId: vars.turmaId,
          data: date,
          registros: vars.registros.map((r) => ({
            alunoId: r.alunoId,
            presente: r.status === "p",
            justificativa:
              r.status === "a" ? r.justificativa ?? "Justificada" : null,
          })),
        },
      }),
    onSuccess: invalidate,
  });

  return {
    today,
    set: async (alunoId: string, status: FrequenciaStatus, _turma?: string) => {
      const tid = _turma ?? turmaId;
      if (!tid) throw new Error("turmaId obrigatório para lançar frequência");
      await lancarMut.mutateAsync({
        turmaId: tid,
        registros: [{ alunoId, status }],
      });
    },
    setMany: async (entries: FrequenciaDia, _turma?: string) => {
      const tid = _turma ?? turmaId;
      if (!tid) throw new Error("turmaId obrigatório para lançar frequência");
      const registros = Object.entries(entries).map(([alunoId, status]) => ({
        alunoId,
        status,
      }));
      if (registros.length === 0) return;
      await lancarMut.mutateAsync({ turmaId: tid, registros });
    },
  };
}

/* =========================================================
 * useContatosExternos
 * ========================================================= */
export function useContatosExternos() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.contatos(),
    queryFn: () => listarContatosExternos(),
  });

  const list: ContatoExterno[] = useMemo(() => data.map(r => ({
    id: r.id,
    nome: r.nome,
    whatsapp: r.whatsapp,
    parentesco: r.parentesco ?? undefined,
    alunoId: r.aluno_id ?? undefined,
    tone: toneFromId(r.id),
  })), [data]);

  const addMut = useMutation({
    mutationFn: (c: Omit<ContatoExterno, "id" | "tone">) => criarContatoExterno({ data: { ...c } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contatos() }),
  });

  const rmMut = useMutation({
    mutationFn: (id: string) => removerContatoExterno({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.contatos() }),
  });

  return {
    list,
    add: (c: Omit<ContatoExterno, "id" | "tone">) => addMut.mutateAsync(c),
    remove: (id: string) => rmMut.mutateAsync(id),
  };
}

/* =========================================================
 * useAvaliacoes
 * ========================================================= */
export function useAvaliacoes(turmaId?: string) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.avaliacoes(turmaId),
    queryFn: () =>
      listarAvaliacoes({ data: turmaId ? { turmaId } : {} }),
    staleTime: 30_000,
  });

  const list = useMemo(() => data.map(mapAvaliacao), [data]);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["avaliacoes"] });

  const addMut = useMutation({
    mutationFn: (a: Omit<Avaliacao, "id"> & { turmaId?: string }) =>
      criarAvaliacao({
        data: {
          turmaId: a.turmaId ?? turmaId ?? "",
          titulo: a.titulo,
          materia: a.mat,
          data: a.data || undefined,
          media: a.media || undefined,
          alunos: a.alunos ?? 0,
          tone: a.tone,
          peso: a.peso ?? 1,
          observacoes: a.observacoes,
        },
      }),
    onSuccess: invalidate,
  });

  const rmMut = useMutation({
    mutationFn: (id: string) => removerAvaliacao({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list,
    add: (a: Omit<Avaliacao, "id"> & { id?: string; turmaId?: string }) =>
      addMut.mutateAsync(a),
    remove: (id: string) => rmMut.mutateAsync(id),
  };
}

/* =========================================================
 * useConversas — agrupa mensagens por contraparte
 * ========================================================= */
const TONES: Tone[] = ["blue", "green", "orange", "purple", "pink", "yellow"];
function toneFromId(id: string): Tone {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function useConversas(meuProfileId?: string) {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: QK.mensagens(),
    queryFn: () => listarMensagens({ data: {} }),
    staleTime: 15_000,
  });

  const list: Conversa[] = useMemo(() => {
    type Row = (typeof data)[number];
    const byKey = new Map<string, Row[]>();
    for (const m of data) {
      const key = m.turma_id
        ? `turma:${m.turma_id}`
        : `dm:${[m.remetente_id, m.destinatario_id].filter(Boolean).sort().join(":")}`;
      const arr = byKey.get(key) ?? [];
      arr.push(m);
      byKey.set(key, arr);
    }
    return Array.from(byKey.entries()).map(([key, msgs]) => {
      const isTurma = key.startsWith("turma:");
      const nome = isTurma ? "Turma" : "Conversa";
      const papel = isTurma ? "Grupo" : "Direta";
      return {
        id: key,
        nome,
        papel,
        tone: toneFromId(key),
        mensagens: msgs.map((m) => ({
          id: m.id,
          from:
            meuProfileId && m.remetente_id === meuProfileId
              ? ("me" as const)
              : ("them" as const),
          text: m.texto,
          time: new Date(m.created_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      } satisfies Conversa;
    });
  }, [data, meuProfileId]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["mensagens"] });
  const sendMut = useMutation({
    mutationFn: (vars: { destinatarioId?: string; turmaId?: string; texto: string }) =>
      enviarMensagem({ data: vars }),
    onSuccess: (data, vars) => {
      invalidate();
      // Se tiver whatsapp e for DM, tenta abrir
      const conv = list.find(c => c.id === `dm:${[vars.destinatarioId].filter(Boolean).join("")}`);
      if (conv?.whatsapp) {
        const tel = conv.whatsapp.replace(/\D/g, "");
        window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(vars.texto)}`, "_blank");
      }
    },
  });
  const lidaMut = useMutation({
    mutationFn: (id: string) => marcarLida({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    list,
    get: (id: string) => list.find((c) => c.id === id),
    send: async (convId: string, text: string) => {
      const conv = list.find((c) => c.id === convId);
      if (!conv) return;
      
      // WhatsApp direto se for contato externo
      if (convId.startsWith("wa:")) {
        const tel = convId.slice(3).replace(/\D/g, "");
        window.open(`https://wa.me/55${tel}?text=${encodeURIComponent(text)}`, "_blank");
        // Salva localmente como "meu" registro? Para agora apenas abre o WA.
        return;
      }

      if (convId.startsWith("turma:")) {
        await sendMut.mutateAsync({
          turmaId: convId.slice(6),
          texto: text,
        });
      } else {
        // dm:<a>:<b> – destinatário = quem não sou eu
        const parts = convId.slice(3).split(":").filter(Boolean);
        const dest = parts.find((p) => p !== meuProfileId) ?? parts[0];
        await sendMut.mutateAsync({ destinatarioId: dest, texto: text });
      }
    },
    markLida: (id: string) => lidaMut.mutateAsync(id),
  };
}

/* =========================================================
 * Perfil + Notificações (Onda C — backend)
 * ========================================================= */
export type Perfil = {
  nome: string;
  email: string;
  cargo: string;
  turma: string;
  ano: string;
  theme: "light" | "dark";
};
const seedPerfil: Perfil = {
  nome: "",
  email: "",
  cargo: "",
  turma: "",
  ano: "",
  theme: "light",
};

export function usePerfil() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["perfil", "me"],
    queryFn: () => getMeuPerfil(),
    staleTime: 60_000,
  });
  const perfil: Perfil = useMemo(() => {
    if (!data) return seedPerfil;
    return {
      nome: data.nome ?? "",
      email: data.email ?? "",
      cargo: data.cargo ?? "",
      turma: data.turma ?? "",
      ano: data.ano ?? "",
      theme: data.theme === "dark" ? "dark" : "light",
    };
  }, [data]);

  const updMut = useMutation({
    mutationFn: (patch: Partial<Perfil>) =>
      atualizarMeuPerfil({
        data: {
          nome: patch.nome,
          cargo: patch.cargo,
          turma: patch.turma,
          ano: patch.ano,
          theme: patch.theme,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["perfil"] }),
  });

  return {
    perfil,
    update: (patch: Partial<Perfil>) => updMut.mutateAsync(patch),
  };
}

export type Notif = {
  id: string;
  title: string;
  sub: string;
  time: string;
  read: boolean;
  tone: string;
};
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

export function useNotifs() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["notificacoes"],
    queryFn: () => listarNotificacoes(),
    staleTime: 30_000,
  });
  const list: Notif[] = useMemo(
    () =>
      data.map((n) => ({
        id: n.id,
        title: n.title,
        sub: n.sub,
        time: relTime(n.created_at),
        read: n.read,
        tone: n.tone,
      })),
    [data],
  );
  const invalidate = () => qc.invalidateQueries({ queryKey: ["notificacoes"] });
  const markAllMut = useMutation({ mutationFn: () => marcarTodasLidas(), onSuccess: invalidate });
  const markOneMut = useMutation({
    mutationFn: (id: string) => marcarNotifLida({ data: { id } }),
    onSuccess: invalidate,
  });
  const createMut = useMutation({
    mutationFn: (vars: { title: string; sub?: string; tone?: string }) =>
      criarNotificacao({ data: { title: vars.title, sub: vars.sub ?? "", tone: vars.tone ?? "blue" } }),
    onSuccess: invalidate,
  });
  return {
    list,
    unread: list.filter((n) => !n.read).length,
    markAll: () => markAllMut.mutateAsync(),
    markOne: (id: string) => markOneMut.mutateAsync(id),
    criar: (vars: { title: string; sub?: string; tone?: string }) => createMut.mutateAsync(vars),
  };
}
