import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MealsByType, MealTypeKey, Recipe } from "./types";

// Forma cruda de las filas devueltas por Supabase (reemplaza el uso de `any`).
interface RawIngredient {
  name: string;
  quantity: string;
}

interface RawRecipe {
  id: string;
  name: string;
  calories: number;
  image_url: string | null;
  meal_type: string;
  recipe_ingredients: RawIngredient[] | null;
}

interface RawMealRow {
  recipe_id: string;
  recipes: RawRecipe | null;
}

/**
 * Lectura server-side del plan de comidas del usuario: une `user_meals` con
 * `recipes` + `recipe_ingredients` y agrupa por tipo de comida.
 */
export async function getUserMeals(userId: string): Promise<MealsByType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_meals")
    .select(
      "recipe_id, recipes(id, name, calories, image_url, meal_type, recipe_ingredients(name, quantity))",
    )
    .eq("user_id", userId);

  if (error) throw error;

  const grouped: MealsByType = { breakfast: [], lunch: [], dinner: [] };

  const rows = (data ?? []) as unknown as RawMealRow[];

  rows.forEach((row) => {
    const r = row.recipes;
    if (!r) return;
    const type = r.meal_type as MealTypeKey;
    if (!grouped[type]) return;

    const recipe: Recipe = {
      id: r.id,
      name: r.name,
      calories: r.calories,
      image_url: r.image_url,
      ingredients: (r.recipe_ingredients ?? []).map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
      })),
    };

    grouped[type].push(recipe);
  });

  return grouped;
}
