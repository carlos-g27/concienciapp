import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DailyWin, TodayWins, WinToday } from "./types";

/**
 * Fecha "de hoy" en la zona horaria de la empresa (America/Bogota), en formato
 * YYYY-MM-DD. La comparten lectura (getTodayWins) y escritura (toggleWinToday)
 * para que "hoy" signifique lo mismo en ambas.
 */
export function appToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Lista de victorias del usuario (para la gestión en /victorias).
 */
export async function getDailyWins(userId: string): Promise<DailyWin[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("daily_wins")
    .select("id, label")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getDailyWins] error:", error);
    return [];
  }

  return (data ?? []) as DailyWin[];
}

/**
 * Victorias del usuario con su estado de cumplimiento de hoy y el % del día.
 * Alimenta el card "Victorias de hoy" del dashboard.
 */
export async function getTodayWins(userId: string): Promise<TodayWins> {
  const supabase = await createClient();
  const today = appToday();

  const { data: wins, error: winsErr } = await supabase
    .from("daily_wins")
    .select("id, label")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (winsErr) {
    console.error("[getTodayWins] wins error:", winsErr);
    return { wins: [], percent: 0 };
  }
  if (!wins || wins.length === 0) return { wins: [], percent: 0 };

  const { data: logs, error: logsErr } = await supabase
    .from("daily_win_logs")
    .select("win_id")
    .eq("user_id", userId)
    .eq("date", today)
    .eq("completed", true);

  if (logsErr) {
    console.error("[getTodayWins] logs error:", logsErr);
  }

  const doneIds = new Set((logs ?? []).map((l) => l.win_id as string));

  const list: WinToday[] = wins.map((w) => ({
    id: w.id as string,
    label: w.label as string,
    completed: doneIds.has(w.id as string),
  }));

  const doneCount = list.filter((w) => w.completed).length;
  const percent = Math.round((doneCount / list.length) * 100);

  return { wins: list, percent };
}
