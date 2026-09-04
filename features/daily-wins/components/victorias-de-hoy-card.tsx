"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleWinToday } from "../actions";
import type { TodayWins, WinToday } from "../types";

export default function VictoriasDeHoyCard({ data }: { data: TodayWins }) {
  const [wins, setWins] = useState<WinToday[]>(data.wins);
  const [, startTransition] = useTransition();

  const percent =
    wins.length === 0
      ? 0
      : Math.round((wins.filter((w) => w.completed).length / wins.length) * 100);

  // Optimista: refleja el cambio de inmediato y revierte si la acción falla.
  const handleToggle = (win: WinToday, next: boolean) => {
    setWins((prev) => prev.map((w) => (w.id === win.id ? { ...w, completed: next } : w)));

    startTransition(async () => {
      const res = await toggleWinToday(win.id, next);
      if (!res.success) {
        setWins((prev) => prev.map((w) => (w.id === win.id ? { ...w, completed: !next } : w)));
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold text-primary">Victorias de hoy</CardTitle>
        {wins.length > 0 && (
          <span className="text-sm font-bold text-primary">{percent}%</span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {wins.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">Aún no tienes victorias diarias.</p>
            <Link
              href="/victorias"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Crear mis victorias
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col">
            {wins.map((win) => (
              <li key={win.id}>
                <label className="flex items-center gap-3 py-2 cursor-pointer group">
                  <Checkbox
                    checked={win.completed}
                    onCheckedChange={(v) => handleToggle(win, v === true)}
                  />
                  <span
                    className={`text-sm transition-colors ${
                      win.completed
                        ? "text-muted-foreground line-through"
                        : "text-foreground group-hover:text-primary"
                    }`}
                  >
                    {win.label}
                  </span>
                </label>
              </li>
            ))}
            <li className="pt-3 mt-1 border-t border-border">
              <Link
                href="/victorias"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Gestionar victorias
              </Link>
            </li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
