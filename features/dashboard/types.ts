// --- Tipos del dominio Dashboard ---

import type { TodayWins } from "@/features/daily-wins/types";

/** Un registro de RM: fecha (ISO YYYY-MM-DD) y peso levantado (kg). */
export interface RmPoint {
  date: string;
  weight: number;
}

/** Progreso de RM de un ejercicio principal (points vacío si aún no hay RM). */
export interface ExerciseRm {
  name: string;
  points: RmPoint[];
}

/** Datos que consume la vista del dashboard. */
export interface DashboardData {
  rmProgress: ExerciseRm[];
  todayWins: TodayWins;
}
