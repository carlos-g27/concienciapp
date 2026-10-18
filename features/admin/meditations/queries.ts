import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Meditation } from "./types";

const MEDITATION_COLUMNS = "id, name, duration, category, video_url";

/** Listado del catálogo de meditaciones (ordenado por nombre). */
export async function getMeditations(): Promise<Meditation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meditations")
    .select(MEDITATION_COLUMNS)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Meditation[];
}

/** Meditación por id (para el formulario de edición). */
export async function getMeditation(id: string): Promise<Meditation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meditations")
    .select(MEDITATION_COLUMNS)
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getMeditation] error:", error);
    return null;
  }
  return data as Meditation;
}
