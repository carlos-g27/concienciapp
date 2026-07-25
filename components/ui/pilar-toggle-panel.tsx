"use client";

import { ReactNode } from "react";

export interface PilarToggleItem {
  key: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  enabled: boolean;
}

interface PilarTogglePanelProps {
  items: PilarToggleItem[];
  onToggle: (key: string, enabled: boolean) => void;
  isLoading?: boolean;
}

// --- Componente 100% presentacional y reutilizable ---
// No sabe si lo usa un admin o un usuario, ni de dónde vienen los datos.
export default function PilarTogglePanel({
  items,
  onToggle,
  isLoading = false,
}: PilarTogglePanelProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[64px] rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-background border border-border"
        >
          {item.icon && (
            <div className="w-9 h-9 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
              {item.icon}
            </div>
          )}

          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <span className="text-sm font-semibold text-foreground">{item.label}</span>
            {item.description && (
              <span className="text-xs text-muted-foreground">{item.description}</span>
            )}
          </div>

          {/* Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={item.enabled}
            aria-label={`${item.enabled ? "Desactivar" : "Activar"} ${item.label}`}
            onClick={() => onToggle(item.key, !item.enabled)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              item.enabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                item.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}