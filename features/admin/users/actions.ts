"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { userUpdateSchema, type UserUpdateFormInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Actualiza los campos permitidos (peso/edad/objetivo) de un usuario.
 * Solo admins (requireAdmin). No toca `role`. El userId viene de la URL a
 * propósito: el admin edita a cualquier usuario.
 */
export async function updateUserProfile(
  userId: string,
  input: UserUpdateFormInput,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminAssign");

  if (!z.string().uuid().safeParse(userId).success) {
    return { success: false, error: t("actInvalidUser") };
  }

  const parsed = userUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: t("actUserInvalidData") };
  }

  const { weight, age, goal } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        weight: weight ?? null,
        age: age ?? null,
        goal: goal ?? null,
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (err) {
    console.error("[updateUserProfile] error:", err);
    return { success: false, error: t("actUserSaveError") };
  }
}
