import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Day, FocusByDay, RoutineByDay } from "./types";

const DAYS: Day[] = ["lunes", "martes", "miercoles", "jueves", "viernes"];

function emptyRoutine(): RoutineByDay {
  return { lunes: [], martes: [], miercoles: [], jueves: [], viernes: [] };
}
function emptyFocus(): FocusByDay {
  return { lunes: "", martes: "", miercoles: "", jueves: "", viernes: "" };
}

interface RawRoutineRow {
  day: string;
  exercise_id: string;
  sets: number;
  reps: number;
  exercises: { name: string; muscle: string } | null;
}

/** Lectura server-side de la rutina + enfoque de un usuario (para el admin). */
export async function getUserRoutineForAdmin(
  userId: string,
): Promise<{ routine: RoutineByDay; focus: FocusByDay }> {
  const supabase = await createClient();

  const [{ data: routinesData, error: routinesError }, { data: focusData, error: focusError }] =
    await Promise.all([
      supabase
        .from("user_routines")
        .select("day, exercise_id, sets, reps, exercises(name, muscle)")
        .eq("user_id", userId),
      supabase.from("user_routine_focus").select("day, focus").eq("user_id", userId),
    ]);

  if (routinesError) throw routinesError;
  if (focusError) throw focusError;

  const routine = emptyRoutine();
  const rows = (routinesData ?? []) as unknown as RawRoutineRow[];
  rows.forEach((row) => {
    const day = row.day as Day;
    if (!DAYS.includes(day)) return;
    routine[day].push({
      exerciseId: row.exercise_id,
      name: row.exercises?.name ?? "Ejercicio",
      muscle: row.exercises?.muscle ?? "",
      sets: row.sets,
      reps: row.reps,
    });
  });

  const focus = emptyFocus();
  (focusData ?? []).forEach((row) => {
    const day = row.day as Day;
    if (DAYS.includes(day)) focus[day] = row.focus ?? "";
  });

  return { routine, focus };
}
