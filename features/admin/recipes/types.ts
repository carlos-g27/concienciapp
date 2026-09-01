// --- Tipos del catálogo de recetas (admin) ---

export type MealType = "breakfast" | "lunch" | "dinner";

export interface Ingredient {
  name: string;
  quantity: string;
}

/** Fila del listado del catálogo. */
export interface RecipeCatalogItem {
  id: string;
  name: string;
  calories: number;
  image_url: string | null;
}

/** Receta completa (para el formulario de edición). */
export interface RecipeFull {
  id: string;
  name: string;
  calories: number;
  image_url: string | null;
  meal_type: MealType;
  ingredients: Ingredient[];
}
