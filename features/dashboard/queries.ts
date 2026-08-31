import "server-only";
import type { DashboardData } from "./types";

/**
 * Capa de datos del dashboard (server-side).
 *
 * Fase 1 (solo arquitectura): devuelve métricas de progreso como PLACEHOLDER,
 * ya tipadas y fluyendo por esta capa. Cuando se conecten los datos reales de
 * Supabase (fase de Pilar Físico y siguientes), este es el ÚNICO lugar a
 * modificar: aquí se consultarán `weight_logs`, `user_routines`,
 * `user_meditations`, etc. con el cliente server (`@/lib/supabase/server`) y el
 * `userId` recibido. La firma no cambiará.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `userId` se usará al conectar datos reales (fase Pilar Físico); la firma se mantiene estable.
export async function getDashboardData(userId: string): Promise<DashboardData> {
  return {
    pilares: [
      { key: "fisico", label: "Pilar físico", value: 64 },
      { key: "nutricion", label: "Pilar nutrición", value: 40 },
      { key: "mental", label: "Pilar mental", value: 90 },
    ],
    rendimiento: [
      { month: "Ene", prev: 40, curr: 55 },
      { month: "Feb", prev: 55, curr: 70 },
      { month: "Mar", prev: 35, curr: 45 },
      { month: "Abr", prev: 60, curr: 80 },
      { month: "May", prev: 50, curr: 65 },
      { month: "Jun", prev: 45, curr: 90 },
      { month: "Jul", prev: 70, curr: 85 },
    ],
  };
}
