import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isMeditationCategory } from "@/features/admin/meditations/types";
import type { CatalogMeditation, MeditationsByCategory } from "./types";

function emptyMeditations(): MeditationsByCategory {
  return { ansiedad: [], gratitud: [], dormir: [] };
}

interface RawUserMeditationRow {
  meditation_id: string;
  meditations: {
    id: string;
    name: string;
    duration: number | null;
    category: string;
  } | null;
}

/** Lectura server-side de las meditaciones asignadas a un usuario, agrupadas por categoría. */
export async function getUserMeditationsForAdmin(userId: string): Promise<MeditationsByCategory> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_meditations")
    .select("meditation_id, meditations(id, name, duration, category)")
    .eq("user_id", userId);

  if (error) throw error;

  const meditations = emptyMeditations();
  const rows = (data ?? []) as unknown as RawUserMeditationRow[];
  rows.forEach((row) => {
    const m = row.meditations;
    if (!m || !isMeditationCategory(m.category)) return;
    meditations[m.category].push({
      meditationId: m.id,
      name: m.name,
      duration: m.duration,
    });
  });

  return meditations;
}

/** Catálogo completo de meditaciones (con categoría) para el picker. */
export async function getMeditationsForPicker(): Promise<CatalogMeditation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("meditations")
    .select("id, name, duration, category")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CatalogMeditation[];
}
