// --- Tipos de la asignación de comidas (admin) ---

export type MealType = "breakfast" | "lunch" | "dinner";

export interface AssignedRecipe {
  recipeId: string;
  name: string;
  calories: number;
  image_url: string | null;
}

export type MealsByType = Record<MealType, AssignedRecipe[]>;

/** Receta del catálogo (para el picker), con su tipo de comida. */
export interface CatalogRecipe {
  id: string;
  name: string;
  calories: number;
  image_url: string | null;
  meal_type: MealType;
}
