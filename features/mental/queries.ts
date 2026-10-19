import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MeditationCategoryKey, MeditationsByCategory } from "./types";

// Forma cruda de las filas devueltas por Supabase.
interface RawMeditation {
  id: string;
  name: string;
  duration: number | null;
  category: string;
  video_url: string | null;
}

interface RawUserMeditationRow {
  meditation_id: string;
  meditations: RawMeditation | null;
}

/**
 * Lectura server-side de las meditaciones del usuario: une `user_meditations`
 * con `meditations` y agrupa por categoría.
 */
export async function getUserMeditations(userId: string): Promise<MeditationsByCategory> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_meditations")
    .select("meditation_id, meditations(id, name, duration, category, video_url)")
    .eq("user_id", userId);

  if (error) throw error;

  const grouped: MeditationsByCategory = { ansiedad: [], gratitud: [], dormir: [] };

  const rows = (data ?? []) as unknown as RawUserMeditationRow[];

  rows.forEach((row) => {
    const m = row.meditations;
    if (!m) return;
    const category = m.category as MeditationCategoryKey;
    if (!grouped[category]) return;

    grouped[category].push({
      id: m.id,
      name: m.name,
      duration: m.duration,
      video_url: m.video_url,
    });
  });

  return grouped;
}
