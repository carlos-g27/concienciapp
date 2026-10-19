// --- Tipos de la asignación de meditaciones (admin) ---

import type { MeditationCategory } from "@/features/admin/meditations/types";

export interface AssignedMeditation {
  meditationId: string;
  name: string;
  /** Duración en minutos. */
  duration: number | null;
}

export type MeditationsByCategory = Record<MeditationCategory, AssignedMeditation[]>;

/** Meditación del catálogo (para el picker), con su categoría. */
export interface CatalogMeditation {
  id: string;
  name: string;
  duration: number | null;
  category: MeditationCategory;
}
