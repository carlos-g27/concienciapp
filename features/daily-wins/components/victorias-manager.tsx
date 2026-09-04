"use client";

import { useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addWin, updateWin, deleteWin } from "../actions";
import { MAX_DAILY_WINS } from "../schema";
import type { DailyWin } from "../types";

interface VictoriasManagerProps {
  initialWins: DailyWin[];
}

export default function VictoriasManager({ initialWins }: VictoriasManagerProps) {
  // `wins` guarda el texto en edición (input controlado); `committed` guarda el
  // último valor confirmado por el servidor, para poder revertir si algo falla.
  const [wins, setWins] = useState<DailyWin[]>(initialWins);
  const committed = useRef<Map<string, string>>(
    new Map(initialWins.map((w) => [w.id, w.label])),
  );

  const [newLabel, setNewLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLabel = (id: string, label: string) =>
    setWins((prev) => prev.map((w) => (w.id === id ? { ...w, label } : w)));

  const limitReached = wins.length >= MAX_DAILY_WINS;

  // --- Agregar ---
  const handleAdd = async () => {
    const label = newLabel.trim();
    if (!label || limitReached) return;

    setError(null);
    setIsAdding(true);
    const res = await addWin(label);
    if (res.success && res.id) {
      setWins((prev) => [...prev, { id: res.id!, label }]);
      committed.current.set(res.id, label);
      setNewLabel("");
    } else {
      setError(res.error ?? "No se pudo agregar la victoria.");
    }
    setIsAdding(false);
  };

  // --- Editar (al salir del input) ---
  const handleEditBlur = async (win: DailyWin) => {
    const original = committed.current.get(win.id) ?? "";
    const label = win.label.trim();

    // Sin cambios reales: normaliza espacios en la UI y no llama al servidor.
    if (label === original) {
      if (win.label !== original) setLabel(win.id, original);
      return;
    }
    // Vacío: no se permite; restaura el valor original.
    if (!label) {
      setLabel(win.id, original);
      return;
    }

    setError(null);
    const res = await updateWin(win.id, label);
    if (res.success) {
      committed.current.set(win.id, label);
      setLabel(win.id, label);
    } else {
      setError(res.error ?? "No se pudo guardar la victoria.");
      setLabel(win.id, original);
    }
  };

  // --- Eliminar ---
  const handleDelete = async (win: DailyWin) => {
    setError(null);
    const res = await deleteWin(win.id);
    if (res.success) {
      committed.current.delete(win.id);
      setWins((prev) => prev.filter((w) => w.id !== win.id));
    } else {
      setError(res.error ?? "No se pudo eliminar la victoria.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Título de página — solo visible en desktop (en móvil ya está en el topbar) */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Victorias diarias</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-primary">Mis victorias</CardTitle>
          <p className="text-sm text-muted-foreground">
            Define tus mini-metas diarias. Cada día podrás marcarlas desde tu dashboard.
          </p>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-4">

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Lista editable */}
          {wins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aún no tienes victorias. Agrega la primera abajo.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {wins.map((win) => (
                <div key={win.id} className="flex items-center gap-3">
                  <Input
                    type="text"
                    value={win.label}
                    onChange={(e) => setLabel(win.id, e.target.value)}
                    onBlur={() => handleEditBlur(win)}
                    maxLength={80}
                    className="flex-1"
                    aria-label="Editar victoria"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(win)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    aria-label="Eliminar victoria"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Agregar victoria */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Label htmlFor="new-win">Nueva victoria</Label>
            <div className="flex items-center gap-3">
              <Input
                id="new-win"
                type="text"
                placeholder="Ej. Beber 2L de agua"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleAdd();
                  }
                }}
                maxLength={80}
                disabled={limitReached}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isAdding || limitReached || newLabel.trim() === ""}
              >
                {isAdding ? "Agregando..." : "Agregar"}
              </Button>
            </div>
            {limitReached && (
              <p className="text-xs text-muted-foreground">
                Has alcanzado el máximo de {MAX_DAILY_WINS} victorias diarias.
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
