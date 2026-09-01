import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseCatalogItem, ExerciseFull } from "./types";

/** Listado del catálogo de ejercicios (ordenado por nombre). */
export async function getExercises(): Promise<ExerciseCatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, muscle")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ExerciseCatalogItem[];
}

/** Ejercicio completo por id (para el formulario de edición). */
export async function getExercise(id: string): Promise<ExerciseFull | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("id, name, muscle, description, instructions, video_url, is_main_lift")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getExercise] error:", error);
    return null;
  }
  return data as ExerciseFull;
}
