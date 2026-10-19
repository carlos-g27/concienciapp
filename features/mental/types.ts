// --- Tipos del dominio Pilar Mental ---

export type MeditationCategoryKey = "ansiedad" | "gratitud" | "dormir";

export interface Meditation {
  id: string;
  name: string;
  /** Duración en minutos. */
  duration: number | null;
  video_url: string | null;
}

/** Meditaciones del usuario agrupadas por categoría. */
export type MeditationsByCategory = Record<MeditationCategoryKey, Meditation[]>;
