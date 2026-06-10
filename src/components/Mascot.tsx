import { useEffect, useState } from "react";

export type MascotId = "robozinho" | "estrelinha" | "corujinha" | "foguete" | "coracaozinho";
export type MascotMood = "happy" | "thinking";

export const MASCOT_OPTIONS: { id: MascotId; nome: string; descricao: string }[] = [
  { id: "robozinho", nome: "Robozinho", descricao: "Fofo e simpático" },
  { id: "estrelinha", nome: "Estrelinha", descricao: "Brilha com você" },
  { id: "corujinha", nome: "Corujinha", descricao: "Sabia e calma" },
  { id: "foguete", nome: "Foguete", descricao: "Cheio de energia" },
  { id: "coracaozinho", nome: "Coraçãozinho", descricao: "Acolhedor" },
];

const KEY = "aprimore.mascot";

export function useMascotChoice() {
  const [id, setId] = useState<MascotId>("robozinho");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && MASCOT_OPTIONS.some((m) => m.id === raw)) setId(raw as MascotId);
    } catch { /* noop */ }
  }, []);
  const save = (v: MascotId) => {
    setId(v);
    try { localStorage.setItem(KEY, v); } catch { /* noop */ }
  };
  return [id, save] as const;
}

export function Mascot({ id, size = 56, mood = "happy" }: { id: MascotId; size?: number; mood?: MascotMood }) {
  const common = {
    width: size,
    height: size,
    "aria-hidden": true as const,
    className: "drop-shadow-[0_6px_12px_rgba(120,90,220,0.35)] motion-safe:animate-[float_3.4s_ease-in-out_infinite]",
  };
  if (id === "estrelinha") return <Estrelinha {...common} mood={mood} />;
  if (id === "corujinha") return <Corujinha {...common} mood={mood} />;
  if (id === "foguete") return <Foguete {...common} mood={mood} />;
  if (id === "coracaozinho") return <Coracaozinho {...common} mood={mood} />;
  return <Robozinho {...common} mood={mood} />;
}

type SvgProps = React.SVGProps<SVGSVGElement> & { mood: MascotMood };

/* ---------- Cores da logo (azul/roxo/amarelo/coral) ---------- */
const C = {
  blueLight: "oklch(0.88 0.1 240)",
  blue: "oklch(0.7 0.16 245)",
  purple: "oklch(0.58 0.18 285)",
  yellow: "oklch(0.88 0.18 95)",
  coral: "oklch(0.78 0.14 25)",
  pink: "oklch(0.78 0.16 10)",
  green: "oklch(0.78 0.15 150)",
  ink: "oklch(0.22 0.06 270)",
};

/* ---------- Robozinho ---------- */
function Robozinho({ mood, ...p }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" {...p}>
      <defs>
        <radialGradient id="rb-body" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor={C.blueLight} />
          <stop offset="55%" stopColor={C.blue} />
          <stop offset="100%" stopColor={C.purple} />
        </radialGradient>
        <radialGradient id="rb-belly" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0%" stopColor="oklch(0.98 0.02 250)" />
          <stop offset="100%" stopColor="oklch(0.9 0.05 250)" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="108" rx="32" ry="5" fill={C.purple} opacity="0.18" />
      <ellipse cx="22" cy="46" rx="9" ry="13" fill="url(#rb-body)" transform="rotate(-18 22 46)" />
      <ellipse cx="98" cy="46" rx="9" ry="13" fill="url(#rb-body)" transform="rotate(18 98 46)" />
      <circle cx="60" cy="62" r="42" fill="url(#rb-body)" />
      <ellipse cx="60" cy="74" rx="26" ry="22" fill="url(#rb-belly)" />
      <path d="M60 20 Q58 12 60 6" stroke={C.purple} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <g className="motion-safe:animate-[pulse_2s_ease-in-out_infinite]">
        <path d="M60 0 L62 5 L67 6 L62 7 L60 12 L58 7 L53 6 L58 5 Z" fill={C.yellow} />
      </g>
      <ellipse cx="44" cy="58" rx="8.5" ry="9.5" fill="white" />
      <ellipse cx="76" cy="58" rx="8.5" ry="9.5" fill="white" />
      <circle cx={mood === "thinking" ? 47 : 45} cy="60" r="4.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 79 : 77} cy="60" r="4.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 48.5 : 46.5} cy="58" r="1.6" fill="white" />
      <circle cx={mood === "thinking" ? 80.5 : 78.5} cy="58" r="1.6" fill="white" />
      <ellipse cx="34" cy="72" rx="5.5" ry="3.5" fill={C.coral} opacity="0.7" />
      <ellipse cx="86" cy="72" rx="5.5" ry="3.5" fill={C.coral} opacity="0.7" />
      {mood === "happy" ? (
        <path d="M50 78 Q60 88 70 78" stroke={C.ink} strokeWidth="2.8" fill={C.coral} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <circle cx="60" cy="80" r="2.5" fill={C.ink} />
      )}
    </svg>
  );
}

/* ---------- Estrelinha ---------- */
function Estrelinha({ mood, ...p }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" {...p}>
      <defs>
        <radialGradient id="st-body" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="oklch(0.95 0.12 95)" />
          <stop offset="60%" stopColor={C.yellow} />
          <stop offset="100%" stopColor="oklch(0.7 0.18 60)" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="110" rx="28" ry="4" fill={C.yellow} opacity="0.3" />
      {/* sparkles */}
      <circle cx="18" cy="30" r="2.5" fill={C.blue} className="motion-safe:animate-pulse" />
      <circle cx="102" cy="32" r="2" fill={C.pink} className="motion-safe:animate-pulse" />
      <circle cx="100" cy="90" r="2.5" fill={C.purple} className="motion-safe:animate-pulse" />
      <circle cx="20" cy="92" r="2" fill={C.green} className="motion-safe:animate-pulse" />
      {/* star body */}
      <path
        d="M60 12 L72 44 L106 48 L80 70 L88 104 L60 86 L32 104 L40 70 L14 48 L48 44 Z"
        fill="url(#st-body)"
        stroke="oklch(0.55 0.16 60)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* face */}
      <ellipse cx="50" cy="60" rx="6" ry="7" fill="white" />
      <ellipse cx="70" cy="60" rx="6" ry="7" fill="white" />
      <circle cx={mood === "thinking" ? 52 : 50} cy="62" r="3.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 72 : 70} cy="62" r="3.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 53 : 51} cy="60.5" r="1.2" fill="white" />
      <circle cx={mood === "thinking" ? 73 : 71} cy="60.5" r="1.2" fill="white" />
      <ellipse cx="42" cy="72" rx="4" ry="2.5" fill={C.coral} opacity="0.7" />
      <ellipse cx="78" cy="72" rx="4" ry="2.5" fill={C.coral} opacity="0.7" />
      {mood === "happy" ? (
        <path d="M52 76 Q60 82 68 76" stroke={C.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="60" cy="78" r="2" fill={C.ink} />
      )}
    </svg>
  );
}

/* ---------- Corujinha ---------- */
function Corujinha({ mood, ...p }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" {...p}>
      <defs>
        <radialGradient id="ow-body" cx="0.5" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="oklch(0.88 0.07 285)" />
          <stop offset="100%" stopColor={C.purple} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="110" rx="30" ry="5" fill={C.purple} opacity="0.2" />
      {/* tufts */}
      <path d="M30 30 L36 12 L48 26 Z" fill={C.purple} />
      <path d="M90 30 L84 12 L72 26 Z" fill={C.purple} />
      {/* body */}
      <ellipse cx="60" cy="64" rx="42" ry="44" fill="url(#ow-body)" />
      {/* belly */}
      <ellipse cx="60" cy="80" rx="26" ry="22" fill="oklch(0.96 0.03 80)" />
      <path d="M44 70 Q60 60 76 70" stroke={C.yellow} strokeWidth="1.5" fill="none" opacity="0.6" />
      <path d="M44 80 Q60 70 76 80" stroke={C.yellow} strokeWidth="1.5" fill="none" opacity="0.6" />
      {/* eye discs */}
      <circle cx="42" cy="54" r="14" fill="white" stroke={C.yellow} strokeWidth="2.5" />
      <circle cx="78" cy="54" r="14" fill="white" stroke={C.yellow} strokeWidth="2.5" />
      <circle cx={mood === "thinking" ? 45 : 42} cy="56" r="6" fill={C.ink} />
      <circle cx={mood === "thinking" ? 81 : 78} cy="56" r="6" fill={C.ink} />
      <circle cx={mood === "thinking" ? 47 : 44} cy="54" r="2" fill="white" />
      <circle cx={mood === "thinking" ? 83 : 80} cy="54" r="2" fill="white" />
      {/* beak */}
      <path d="M54 68 L60 78 L66 68 Z" fill={C.yellow} stroke="oklch(0.6 0.16 70)" strokeWidth="1" strokeLinejoin="round" />
      {mood === "happy" && (
        <path d="M52 84 Q60 90 68 84" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      )}
      {/* wings */}
      <ellipse cx="22" cy="70" rx="8" ry="16" fill={C.purple} transform="rotate(-15 22 70)" />
      <ellipse cx="98" cy="70" rx="8" ry="16" fill={C.purple} transform="rotate(15 98 70)" />
      {/* feet */}
      <path d="M48 104 L48 110 M52 104 L52 110 M56 104 L56 110" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" />
      <path d="M64 104 L64 110 M68 104 L68 110 M72 104 L72 110" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Foguete ---------- */
function Foguete({ mood, ...p }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" {...p}>
      <defs>
        <linearGradient id="rk-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.98 0.02 250)" />
          <stop offset="100%" stopColor="oklch(0.85 0.06 250)" />
        </linearGradient>
        <linearGradient id="rk-flame" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.yellow} />
          <stop offset="100%" stopColor={C.coral} />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="113" rx="22" ry="4" fill={C.coral} opacity="0.3" />
      {/* flame */}
      <path d="M48 92 Q60 116 72 92 Q66 100 60 90 Q54 100 48 92 Z" fill="url(#rk-flame)" className="motion-safe:animate-pulse" />
      {/* body */}
      <path d="M60 12 Q40 30 40 70 L40 94 L80 94 L80 70 Q80 30 60 12 Z" fill="url(#rk-body)" stroke={C.blue} strokeWidth="2" />
      {/* nose stripe */}
      <path d="M60 12 Q50 30 50 50 L70 50 Q70 30 60 12 Z" fill={C.coral} opacity="0.8" />
      {/* window */}
      <circle cx="60" cy="58" r="14" fill={C.blue} stroke="white" strokeWidth="3" />
      <ellipse cx="50" cy="58" rx="6" ry="7" fill="white" opacity="0.95" />
      <ellipse cx="70" cy="58" rx="6" ry="7" fill="white" opacity="0.95" />
      <circle cx={mood === "thinking" ? 52 : 50} cy="60" r="3" fill={C.ink} />
      <circle cx={mood === "thinking" ? 72 : 70} cy="60" r="3" fill={C.ink} />
      <circle cx={mood === "thinking" ? 53 : 51} cy="59" r="0.9" fill="white" />
      <circle cx={mood === "thinking" ? 73 : 71} cy="59" r="0.9" fill="white" />
      {mood === "happy" ? (
        <path d="M55 67 Q60 71 65 67" stroke={C.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      ) : (
        <circle cx="60" cy="68" r="1.5" fill={C.ink} />
      )}
      {/* fins */}
      <path d="M40 75 L24 95 L40 92 Z" fill={C.coral} />
      <path d="M80 75 L96 95 L80 92 Z" fill={C.coral} />
      {/* star sparkle */}
      <circle cx="20" cy="26" r="2" fill={C.yellow} className="motion-safe:animate-pulse" />
      <circle cx="100" cy="32" r="2" fill={C.purple} className="motion-safe:animate-pulse" />
    </svg>
  );
}

/* ---------- Coraçãozinho ---------- */
function Coracaozinho({ mood, ...p }: SvgProps) {
  return (
    <svg viewBox="0 0 120 120" {...p}>
      <defs>
        <radialGradient id="hr-body" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="oklch(0.92 0.08 15)" />
          <stop offset="100%" stopColor={C.pink} />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="112" rx="28" ry="4" fill={C.pink} opacity="0.25" />
      <path
        d="M60 100 C 30 80 8 58 8 36 C 8 22 20 12 34 12 C 46 12 56 22 60 30 C 64 22 74 12 86 12 C 100 12 112 22 112 36 C 112 58 90 80 60 100 Z"
        fill="url(#hr-body)"
        stroke="oklch(0.5 0.18 10)"
        strokeWidth="2"
      />
      {/* shine */}
      <ellipse cx="36" cy="32" rx="12" ry="8" fill="white" opacity="0.55" transform="rotate(-30 36 32)" />
      {/* eyes */}
      <ellipse cx="46" cy="48" rx="6" ry="7" fill="white" />
      <ellipse cx="74" cy="48" rx="6" ry="7" fill="white" />
      <circle cx={mood === "thinking" ? 48 : 46} cy="50" r="3.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 76 : 74} cy="50" r="3.5" fill={C.ink} />
      <circle cx={mood === "thinking" ? 49 : 47} cy="48.5" r="1.2" fill="white" />
      <circle cx={mood === "thinking" ? 77 : 75} cy="48.5" r="1.2" fill="white" />
      <ellipse cx="36" cy="62" rx="4" ry="2.5" fill={C.coral} opacity="0.7" />
      <ellipse cx="84" cy="62" rx="4" ry="2.5" fill={C.coral} opacity="0.7" />
      {mood === "happy" ? (
        <path d="M50 66 Q60 74 70 66" stroke={C.ink} strokeWidth="2.5" fill={C.coral} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <circle cx="60" cy="68" r="2" fill={C.ink} />
      )}
    </svg>
  );
}
