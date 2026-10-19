"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { saveMeditationsSchema, type SaveMeditationsInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Reemplaza las meditaciones asignadas a un usuario de forma ATÓMICA vía la
 * RPC `replace_user_meditations` (delete + insert en una transacción).
 */
export async function saveUserMeditations(
  userId: string,
  input: SaveMeditationsInput,
): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminAssign");

  if (!z.string().uuid().safeParse(userId).success) {
    return { success: false, error: t("actInvalidUser") };
  }

  const parsed = saveMeditationsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: t("actMeditationsInvalid") };
  }

  try {
    const supabase = await createClient();
    const p_meditations = parsed.data.meditationIds.map((meditationId) => ({
      meditation_id: meditationId,
    }));

    const { error } = await supabase.rpc("replace_user_meditations", {
      p_user_id: userId,
      p_meditations: p_meditations,
    });

    if (error) throw error;

    revalidatePath(`/admin/users/${userId}/mental`);
    return { success: true };
  } catch (err) {
    console.error("[saveUserMeditations] error:", err);
    return { success: false, error: t("actMeditationsSaveError") };
  }
}
