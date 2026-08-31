// --- Tipos del dominio Dashboard ---

/** Clave de pilar. La presentación (color, estilo) se resuelve en la vista. */
export type PilarKey = "fisico" | "nutricion" | "mental";

/** Progreso de un pilar mostrado como anillo (donut). `value` en rango 0–100. */
export interface PilarProgress {
  key: PilarKey;
  label: string;
  value: number;
}

/** Punto de la gráfica de rendimiento: período anterior vs. actual. */
export interface RendimientoPunto {
  month: string;
  prev: number;
  curr: number;
}

/** Datos que consume la vista del dashboard. */
export interface DashboardData {
  pilares: PilarProgress[];
  rendimiento: RendimientoPunto[];
}
