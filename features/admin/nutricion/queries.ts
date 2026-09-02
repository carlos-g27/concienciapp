import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { CatalogRecipe, MealType, MealsByType } from "./types";

function emptyMeals(): MealsByType {
  return { breakfast: [], lunch: [], dinner: [] };
}

interface RawMealRow {
  recipe_id: string;
  recipes: {
    id: string;
    name: string;
    calories: number;
    image_url: string | null;
    meal_type: string;
  } | null;
}

/** Lectura server-side de las recetas asignadas a un usuario, agrupadas por comida. */
export async function getUserMealsForAdmin(userId: string): Promise<MealsByType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_meals")
    .select("recipe_id, recipes(id, name, calories, image_url, meal_type)")
    .eq("user_id", userId);

  if (error) throw error;

  const meals = emptyMeals();
  const rows = (data ?? []) as unknown as RawMealRow[];
  rows.forEach((row) => {
    const r = row.recipes;
    if (!r) return;
    const type = r.meal_type as MealType;
    if (!meals[type]) return;
    meals[type].push({
      recipeId: r.id,
      name: r.name,
      calories: r.calories,
      image_url: r.image_url,
    });
  });

  return meals;
}

/** Catálogo completo de recetas (con meal_type) para el picker. */
export async function getRecipesForPicker(): Promise<CatalogRecipe[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, calories, image_url, meal_type")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CatalogRecipe[];
}
