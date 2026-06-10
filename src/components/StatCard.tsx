import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  value: string;
  label: string;
  sub?: string;
  pill?: { text: string; tone: "green" | "orange" };
  tone: "blue" | "green" | "orange" | "purple" | "yellow";
  onClick?: () => void;
}

const toneMap = {
  blue: { bg: "var(--stat-blue-soft)", fg: "var(--stat-blue)" },
  green: { bg: "var(--stat-green-soft)", fg: "var(--stat-green)" },
  orange: { bg: "var(--stat-orange-soft)", fg: "var(--stat-orange)" },
  purple: { bg: "var(--stat-purple-soft)", fg: "var(--stat-purple)" },
  yellow: { bg: "var(--stat-yellow-soft)", fg: "var(--stat-yellow)" },
} as const;

export function StatCard({ icon: Icon, value, label, sub, pill, tone, onClick }: Props) {
  const t = toneMap[tone];
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: t.bg, color: t.fg }}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="text-4xl font-extrabold" style={{ color: t.fg }}>
          {value}
        </div>
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
      {pill && (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            backgroundColor: pill.tone === "green" ? "var(--stat-green-soft)" : "var(--stat-orange-soft)",
            color: pill.tone === "green" ? "var(--stat-green)" : "var(--stat-orange)",
          }}
        >
          {pill.text}
        </span>
      )}
    </button>
  );
}