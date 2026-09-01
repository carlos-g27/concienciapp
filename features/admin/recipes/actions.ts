"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { recipeSchema, type RecipeInput, type RecipeFormInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function recipePayload(input: RecipeInput) {
  return {
    name: input.name,
    calories: input.calories,
    image_url: input.imageUrl ?? null,
    meal_type: input.mealType,
  };
}

export async function createRecipe(input: RecipeFormInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { data: inserted, error: insertError } = await supabase
      .from("recipes")
      .insert(recipePayload(parsed.data))
      .select("id")
      .single();
    if (insertError) throw insertError;

    const ingredients = parsed.data.ingredients;
    if (ingredients.length > 0) {
      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredients.map((i) => ({ recipe_id: inserted.id, name: i.name, quantity: i.quantity })));
      if (ingError) throw ingError;
    }

    revalidatePath("/admin/catalog/recipes");
    return { success: true };
  } catch (err) {
    console.error("[createRecipe] error:", err);
    return { success: false, error: "No se pudo crear la receta." };
  }
}

export async function updateRecipe(id: string, input: RecipeFormInput): Promise<ActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Receta inválida." };
  }

  const parsed = recipeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("recipes")
      .update(recipePayload(parsed.data))
      .eq("id", id);
    if (updateError) throw updateError;

    // Reemplazo completo de ingredientes (borrar + insertar).
    const { error: deleteError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", id);
    if (deleteError) throw deleteError;

    const ingredients = parsed.data.ingredients;
    if (ingredients.length > 0) {
      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(ingredients.map((i) => ({ recipe_id: id, name: i.name, quantity: i.quantity })));
      if (ingError) throw ingError;
    }

    revalidatePath("/admin/catalog/recipes");
    return { success: true };
  } catch (err) {
    console.error("[updateRecipe] error:", err);
    return { success: false, error: "No se pudo guardar la receta." };
  }
}

export async function deleteRecipe(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Receta inválida." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catalog/recipes");
    return { success: true };
  } catch (err) {
    console.error("[deleteRecipe] error:", err);
    return { success: false, error: "No se pudo eliminar la receta." };
  }
}
