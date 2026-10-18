// --- Tipos del catálogo de meditaciones (admin) ---

// Valores permitidos por el check `meditations_category_check` de la DB.
export const MEDITATION_CATEGORIES = ["ansiedad", "gratitud", "dormir"] as const;

export type MeditationCategory = (typeof MEDITATION_CATEGORIES)[number];

// Clave de traducción (namespace `adminCatalog`) de cada categoría.
export const MEDITATION_CATEGORY_LABEL_KEYS: Record<MeditationCategory, string> = {
  ansiedad: "medCatAnsiedad",
  gratitud: "medCatGratitud",
  dormir: "medCatDormir",
};

export function isMeditationCategory(value: string | null | undefined): value is MeditationCategory {
  return MEDITATION_CATEGORIES.includes(value as MeditationCategory);
}

/** Meditación del catálogo (listado y formulario de edición). */
export interface Meditation {
  id: string;
  name: string;
  /** Duración en minutos. */
  duration: number | null;
  category: string | null;
  video_url: string | null;
}
