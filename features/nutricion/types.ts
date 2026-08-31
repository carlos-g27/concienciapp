// --- Tipos del dominio Pilar Nutrición ---

export type MealTypeKey = "breakfast" | "lunch" | "dinner";

export interface Ingredient {
  name: string;
  quantity: string; // texto libre, ej: "200 g", "1 unidad"
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  image_url?: string | null;
  ingredients: Ingredient[];
}

/** Recetas del usuario agrupadas por tipo de comida. */
export type MealsByType = Record<MealTypeKey, Recipe[]>;
