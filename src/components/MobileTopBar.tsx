import type { ReactNode } from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import logoUrl from "@/assets/aprimore-logo.png";

interface Props {
  sidebar: ReactNode;
  title?: ReactNode;
  variant?: "light" | "dark";
}

/**
 * Hamburger top bar mostrado apenas em < md.
 * Empacota a sidebar existente dentro de um Sheet (off-canvas).
 */
export function MobileTopBar({ sidebar, title, variant = "light" }: Props) {
  const [open, setOpen] = useState(false);
  const isDark = variant === "dark";
  return (
    <div
      className={`sticky top-0 z-30 flex items-center gap-3 border-b px-3 py-2 md:hidden ${
        isDark
          ? "border-zinc-800/80 bg-[#070710]/95 text-zinc-100 backdrop-blur"
          : "border-border bg-background/95 text-foreground backdrop-blur"
      }`}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Abrir menu"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-xl transition ${
              isDark ? "hover:bg-zinc-800/60" : "hover:bg-accent"
            }`}
          >
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className={`w-[min(85vw,20rem)] overflow-y-auto p-0 ${isDark ? "bg-[#070710] text-zinc-100" : ""}`}
          onClick={(e) => {
            // Fecha ao clicar em qualquer link/botão de navegação dentro
            const target = e.target as HTMLElement;
            if (target.closest("a, button")) setOpen(false);
          }}
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <img src={logoUrl} alt="" aria-hidden className="h-8 w-8 shrink-0 rounded-lg bg-white object-contain p-1" />
        <div className="min-w-0 truncate text-sm font-bold">{title ?? "Aprimore"}</div>
      </div>
    </div>
  );
}
