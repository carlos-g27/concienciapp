import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getTodayWins } from "@/features/daily-wins/queries";
import type { DashboardData, ExerciseRm, RmPoint } from "./types";

interface RawRmRow {
  weight: number | string;
  created_at: string;
  exercises: { name: string } | null;
}

/**
 * Progreso de RM del usuario por cada ejercicio principal (is_main_lift).
 * Devuelve TODOS los ejercicios principales (con points vacío si aún no hay RM)
 * para poder listarlos en el selector y mostrar el estado "sin datos".
 */
export async function getRmProgress(userId: string): Promise<ExerciseRm[]> {
  const supabase = await createClient();

  // 1) Ejercicios principales (base del selector)
  const { data: mainLifts, error: mainErr } = await supabase
    .from("exercises")
    .select("id, name")
    .eq("is_main_lift", true)
    .order("name", { ascending: true });

  if (mainErr) {
    console.error("[getRmProgress] main lifts error:", mainErr);
    return [];
  }
  if (!mainLifts || mainLifts.length === 0) return [];

  // 2) Registros RM del usuario para esos ejercicios
  const { data: logs, error: logsErr } = await supabase
    .from("weight_logs")
    .select("weight, created_at, exercises!inner(name)")
    .eq("user_id", userId)
    .eq("is_rm", true)
    .eq("exercises.is_main_lift", true)
    .order("created_at", { ascending: true });

  if (logsErr) {
    console.error("[getRmProgress] logs error:", logsErr);
  }

  const pointsByName = new Map<string, RmPoint[]>();
  ((logs ?? []) as unknown as RawRmRow[]).forEach((row) => {
    const name = row.exercises?.name;
    if (!name) return;
    const list = pointsByName.get(name) ?? [];
    list.push({ date: row.created_at.slice(0, 10), weight: Number(row.weight) });
    pointsByName.set(name, list);
  });

  return mainLifts.map((ex) => ({
    name: ex.name,
    points: pointsByName.get(ex.name) ?? [],
  }));
}

/**
 * Datos del dashboard: progreso de RM (getRmProgress) y victorias de hoy
 * (getTodayWins). Ambos son datos reales del usuario.
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [rmProgress, todayWins] = await Promise.all([
    getRmProgress(userId),
    getTodayWins(userId),
  ]);

  return { rmProgress, todayWins };
}
