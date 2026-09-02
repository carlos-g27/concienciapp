// --- Tipos de la asignación de rutina (admin) ---

export type Day = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

export interface AssignedExercise {
  exerciseId: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
}

export type RoutineByDay = Record<Day, AssignedExercise[]>;
export type FocusByDay = Record<Day, string>;

/** Ejercicio del catálogo (para el picker). */
export interface CatalogExercise {
  id: string;
  name: string;
  muscle: string;
}
