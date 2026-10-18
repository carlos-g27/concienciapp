// --- Tipos del catálogo de meditaciones (admin) ---

/** Meditación del catálogo (listado y formulario de edición). */
export interface Meditation {
  id: string;
  name: string;
  /** Duración en minutos. */
  duration: number | null;
  category: string | null;
  video_url: string | null;
}
