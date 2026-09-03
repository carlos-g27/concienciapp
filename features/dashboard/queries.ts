import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DashboardData, RmProgress, RmSeriesPoint } from "./types";

interface RawRmRow {
  weight: number | string;
  created_at: string;
  exercises: { name: string; is_main_lift: boolean } | null;
}

/**
 * Progreso de RM (repetición máxima) del usuario para los ejercicios
 * principales (is_main_lift). Solo registros marcados como RM (is_rm=true).
 * Devuelve las series fusionadas por fecha para el gráfico de líneas.
 */
export async function getRmProgress(userId: string): Promise<RmProgress> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("weight_logs")
    .select("weight, created_at, exercises!inner(name, is_main_lift)")
    .eq("user_id", userId)
    .eq("is_rm", true)
    .eq("exercises.is_main_lift", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getRmProgress] error:", error);
    return { exercises: [], points: [] };
  }

  const rows = (data ?? []) as unknown as RawRmRow[];
  const exerciseSet = new Set<string>();
  const byDate = new Map<string, RmSeriesPoint>();

  rows.forEach((row) => {
    const ex = row.exercises;
    if (!ex) return;
    exerciseSet.add(ex.name);
    const date = row.created_at.slice(0, 10); // YYYY-MM-DD
    const point = byDate.get(date) ?? { date };
    point[ex.name] = Number(row.weight);
    byDate.set(date, point);
  });

  const points = Array.from(byDate.values()).sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );

  return { exercises: Array.from(exerciseSet), points };
}

/**
 * Datos del dashboard. Las métricas de pilares siguen como placeholder tipado;
 * el progreso de RM es real (getRmProgress).
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const rmProgress = await getRmProgress(userId);

  return {
    pilares: [
      { key: "fisico", label: "Pilar físico", value: 64 },
      { key: "nutricion", label: "Pilar nutrición", value: 40 },
      { key: "mental", label: "Pilar mental", value: 90 },
    ],
    rmProgress,
  };
}
