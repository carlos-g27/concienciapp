// --- Tipos del dominio Dashboard ---

/** Clave de pilar. La presentación (color, estilo) se resuelve en la vista. */
export type PilarKey = "fisico" | "nutricion" | "mental";

/** Progreso de un pilar mostrado como anillo (donut). `value` en rango 0–100. */
export interface PilarProgress {
  key: PilarKey;
  label: string;
  value: number;
}

/** Punto del gráfico de RM: una fecha con el peso de cada ejercicio. */
export interface RmSeriesPoint {
  date: string; // ISO YYYY-MM-DD
  [exercise: string]: number | string;
}

/** Progreso de RM: nombres de ejercicios (líneas) + puntos fusionados por fecha. */
export interface RmProgress {
  exercises: string[];
  points: RmSeriesPoint[];
}

/** Datos que consume la vista del dashboard. */
export interface DashboardData {
  pilares: PilarProgress[];
  rmProgress: RmProgress;
}
