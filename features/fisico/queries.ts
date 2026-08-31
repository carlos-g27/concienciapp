import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Day, Exercise, WorkoutDay } from "./types";

const DAYS_ORDER: { key: Day; displayName: string }[] = [
  { key: "lunes", displayName: "Lunes" },
  { key: "martes", displayName: "Martes" },
  { key: "miercoles", displayName: "Miércoles" },
  { key: "jueves", displayName: "Jueves" },
  { key: "viernes", displayName: "Viernes" },
];

// Forma cruda de las filas devueltas por Supabase (reemplaza el uso de `any`).
interface RawExercise {
  id: string;
  name: string;
  muscle: string;
  description: string | null;
  instructions: string[] | null;
  video_url: string | null;
  is_main_lift: boolean | null;
}

interface RawRoutineRow {
  day: string;
  sets: number;
  reps: number;
  created_at: string;
  exercises: RawExercise | null;
}

/**
 * Lectura server-side de la rutina del usuario: une `user_routines` con
 * `exercises` y `user_routine_focus`, y arma la estructura por día.
 */
export async function getUserRoutine(userId: string): Promise<WorkoutDay[]> {
  const supabase = await createClient();

  const [
    { data: routinesData, error: routinesError },
    { data: focusData, error: focusError },
  ] = await Promise.all([
    supabase
      .from("user_routines")
      .select(
        "day, sets, reps, created_at, exercises(id, name, muscle, description, instructions, video_url, is_main_lift)",
      )
      .eq("user_id", userId),
    supabase.from("user_routine_focus").select("day, focus").eq("user_id", userId),
  ]);

  if (routinesError) throw routinesError;
  if (focusError) throw focusError;

  const focusByDay: Record<string, string> = {};
  (focusData ?? []).forEach((row) => {
    focusByDay[row.day] = row.focus;
  });

  const rows = (routinesData ?? []) as unknown as RawRoutineRow[];

  return DAYS_ORDER.map(({ key, displayName }) => {
    const exercisesForDay: Exercise[] = rows
      .filter((row) => row.day === key && row.exercises)
      .map((row) => {
        const ex = row.exercises as RawExercise;
        return {
          id: ex.id,
          name: ex.name,
          muscle: ex.muscle,
          sets: row.sets,
          reps: row.reps,
          description: ex.description ?? "",
          instructions: ex.instructions ?? [],
          video_url: ex.video_url ?? null,
          is_main_lift: ex.is_main_lift ?? false,
          assigned_at: row.created_at,
        };
      });

    return {
      day: key,
      displayName,
      label: focusByDay[key] ?? "",
      exercises: exercisesForDay,
    };
  });
}
