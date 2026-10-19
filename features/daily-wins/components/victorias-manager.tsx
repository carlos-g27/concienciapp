"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import { saveWins } from "../actions";
import { MAX_DAILY_WINS } from "../schema";
import type { DailyWin } from "../types";

interface VictoriasManagerProps {
  initialWins: DailyWin[];
}

/** Fila en edición: `key` estable para React; `id` solo si ya existe en la base. */
interface WinRow {
  key: string;
  id?: string;
  label: string;
}

const toRows = (wins: DailyWin[]): WinRow[] => wins.map((w) => ({ key: w.id, id: w.id, label: w.label }));
const snapshot = (rows: WinRow[]) => JSON.stringify(rows.map((r) => ({ id: r.id ?? null, label: r.label.trim() })));

export default function VictoriasManager({ initialWins }: VictoriasManagerProps) {
  const t = useTranslations("victorias");

  // Los cambios quedan en pantalla hasta pulsar "Guardar cambios".
  const [wins, setWins] = useState<WinRow[]>(() => toRows(initialWins));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(toRows(initialWins)));
  const [newLabel, setNewLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDirty = snapshot(wins) !== savedSnapshot;
  useUnsavedChangesWarning(isDirty);

  const limitReached = wins.length >= MAX_DAILY_WINS;

  const setLabel = (key: string, label: string) =>
    setWins((prev) => prev.map((w) => (w.key === key ? { ...w, label } : w)));

  // --- Agregar (solo en pantalla) ---
  const handleAdd = () => {
    const label = newLabel.trim();
    if (!label || limitReached) return;
    setWins((prev) => [...prev, { key: crypto.randomUUID(), label }]);
    setNewLabel("");
  };

  // --- Eliminar (solo en pantalla) ---
  const handleDelete = (key: string) => {
    setWins((prev) => prev.filter((w) => w.key !== key));
  };

  // --- Guardar todos los cambios ---
  const handleSave = async () => {
    setError(null);
    setSuccessMsg(null);

    if (wins.some((w) => !w.label.trim())) {
      setError(t("errEmpty"));
      return;
    }

    setIsSaving(true);
    const res = await saveWins({
      wins: wins.map((w) => ({ ...(w.id ? { id: w.id } : {}), label: w.label.trim() })),
    });

    if (res.success && res.wins) {
      const rows = toRows(res.wins);
      setWins(rows);
      setSavedSnapshot(snapshot(rows));
      setSuccessMsg(t("saved"));
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? t("errSave"));
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">

      {/* Volver al dashboard */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToHome")}
      </Link>

      {/* Título (solo desktop; en móvil ya está en el topbar) + Guardar cambios */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="hidden lg:block text-2xl font-bold text-foreground tracking-tight">{t("title")}</h1>
        <Button onClick={handleSave} disabled={isSaving || !isDirty} className="ml-auto">
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>

      {successMsg && (
        <div className="px-4 py-3 rounded-[10px] bg-green-600/10 text-green-600 text-[0.85rem] font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-[10px] bg-red-600/10 text-destructive text-[0.85rem] font-medium">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-primary">{t("myWins")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("manageSubtitle")}
          </p>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-4">

          {/* Lista editable */}
          {wins.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("emptyManager")}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {wins.map((win) => (
                <div key={win.key} className="flex items-center gap-3">
                  <Input
                    type="text"
                    value={win.label}
                    onChange={(e) => setLabel(win.key, e.target.value)}
                    maxLength={80}
                    className="flex-1"
                    aria-label={t("editAria")}
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(win.key)}
                    className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    aria-label={t("deleteAria")}
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
            <Label htmlFor="new-win">{t("newWin")}</Label>
            <div className="flex items-center gap-3">
              <Input
                id="new-win"
                type="text"
                placeholder={t("newWinPlaceholder")}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                maxLength={80}
                disabled={limitReached}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                disabled={limitReached || newLabel.trim() === ""}
              >
                {t("add")}
              </Button>
            </div>
            {limitReached && (
              <p className="text-xs text-muted-foreground">
                {t("limitReached", { max: MAX_DAILY_WINS })}
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
