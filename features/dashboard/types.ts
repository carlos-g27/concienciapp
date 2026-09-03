// --- Tipos del dominio Dashboard ---

/** Clave de pilar. La presentación (color, estilo) se resuelve en la vista. */
export type PilarKey = "fisico" | "nutricion" | "mental";

/** Progreso de un pilar mostrado como anillo (donut). `value` en rango 0–100. */
export interface PilarProgress {
  key: PilarKey;
  label: string;
  value: number;
}

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
  pilares: PilarProgress[];
  rmProgress: ExerciseRm[];
}
