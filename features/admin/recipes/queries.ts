import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { MealType, RecipeCatalogItem, RecipeFull } from "./types";

interface RawIngredient {
  name: string;
  quantity: string;
}

/** Listado del catálogo de recetas (ordenado por nombre). */
export async function getRecipes(): Promise<RecipeCatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select("id, name, calories, image_url")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as RecipeCatalogItem[];
}

/** Receta completa (con ingredientes) por id, para el formulario de edición. */
export async function getRecipe(id: string): Promise<RecipeFull | null> {
  const supabase = await createClient();

  const [{ data: recipe, error: recipeError }, { data: ingredients, error: ingError }] =
    await Promise.all([
      supabase.from("recipes").select("id, name, calories, image_url, meal_type").eq("id", id).single(),
      supabase.from("recipe_ingredients").select("name, quantity").eq("recipe_id", id),
    ]);

  if (recipeError) {
    console.error("[getRecipe] error:", recipeError);
    return null;
  }
  if (ingError) throw ingError;

  return {
    id: recipe.id,
    name: recipe.name,
    calories: recipe.calories,
    image_url: recipe.image_url,
    meal_type: recipe.meal_type as MealType,
    ingredients: (ingredients ?? []) as RawIngredient[],
  };
}
