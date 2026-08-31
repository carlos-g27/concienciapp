// --- Tipos del dominio Pilar Físico ---

export type Day = "lunes" | "martes" | "miercoles" | "jueves" | "viernes";

/** Ejercicio asignado dentro de la rutina de un día. */
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  description: string;
  instructions: string[];
  video_url?: string | null;
  is_main_lift?: boolean; // true para Press de Banca, Peso Muerto, Sentadilla
  assigned_at?: string; // fecha en que el admin asignó el ejercicio (referencia del ciclo RM)
}

/** Día de entrenamiento con su enfoque y ejercicios. */
export interface WorkoutDay {
  day: Day;
  displayName: string;
  label: string;
  exercises: Exercise[];
}

/** Registro de peso de un ejercicio. */
export interface WeightLog {
  id: string;
  weight: number;
  date: string; // ISO string (created_at en Supabase)
  is_rm: boolean;
}
