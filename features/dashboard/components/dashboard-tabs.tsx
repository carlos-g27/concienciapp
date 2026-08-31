"use client";

import { useState } from "react";

// Único island interactivo del dashboard: barra de tabs.
// El resto de la vista es server-first.

type Tab = "improvement" | "general";

export default function DashboardTabs() {
  const [active, setActive] = useState<Tab>("improvement");

  return (
    <div className="flex gap-6 border-b-2 border-border">
      <button
        onClick={() => setActive("improvement")}
        className={
          active === "improvement"
            ? "relative pb-3 text-sm font-bold text-primary after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-t"
            : "pb-3 text-sm font-medium text-accent hover:text-muted-foreground transition-colors"
        }
      >
        Improvement
      </button>
      <button
        onClick={() => setActive("general")}
        className={
          active === "general"
            ? "relative pb-3 text-sm font-bold text-primary after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-t"
            : "pb-3 text-sm font-medium text-accent hover:text-muted-foreground transition-colors"
        }
      >
        General
      </button>
    </div>
  );
}
