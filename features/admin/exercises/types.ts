// --- Tipos del catálogo de ejercicios (admin) ---

/** Fila del listado del catálogo. */
export interface ExerciseCatalogItem {
  id: string;
  name: string;
  muscle: string;
}

/** Ejercicio completo (para el formulario de edición). */
export interface ExerciseFull {
  id: string;
  name: string;
  muscle: string;
  description: string | null;
  instructions: string[] | null;
  video_url: string | null;
  is_main_lift: boolean | null;
}
