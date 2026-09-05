"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { saveMealsSchema, type SaveMealsInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Reemplaza el plan de comidas completo de un usuario de forma ATÓMICA vía la
 * RPC `replace_user_meals` (delete + insert en una transacción).
 */
export async function saveUserMeals(userId: string, input: SaveMealsInput): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminAssign");

  if (!z.string().uuid().safeParse(userId).success) {
    return { success: false, error: t("actInvalidUser") };
  }

  const parsed = saveMealsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: t("actMealsInvalid") };
  }

  try {
    const supabase = await createClient();
    const p_meals = parsed.data.recipeIds.map((recipeId) => ({ recipe_id: recipeId }));

    const { error } = await supabase.rpc("replace_user_meals", {
      p_user_id: userId,
      p_meals: p_meals,
    });

    if (error) throw error;

    revalidatePath(`/admin/users/${userId}/nutricion`);
    return { success: true };
  } catch (err) {
    console.error("[saveUserMeals] error:", err);
    return { success: false, error: t("actMealsSaveError") };
  }
}
