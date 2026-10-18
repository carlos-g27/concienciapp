"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { meditationSchema, type MeditationInput, type MeditationFormInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

// Construye el payload de DB a partir de la entrada validada.
function toPayload(input: MeditationInput) {
  return {
    name: input.name,
    category: input.category,
    video_url: input.videoUrl,
    duration: input.duration,
  };
}

export async function createMeditation(input: MeditationFormInput): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminCatalog");

  const parsed = meditationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? t("medActInvalid") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("meditations").insert(toPayload(parsed.data));
    if (error) throw error;

    revalidatePath("/admin/catalog/meditations");
    return { success: true };
  } catch (err) {
    console.error("[createMeditation] error:", err);
    return { success: false, error: t("medActCreate") };
  }
}

export async function updateMeditation(id: string, input: MeditationFormInput): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminCatalog");

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: t("medActInvalidId") };
  }

  const parsed = meditationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? t("medActInvalid") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("meditations").update(toPayload(parsed.data)).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catalog/meditations");
    return { success: true };
  } catch (err) {
    console.error("[updateMeditation] error:", err);
    return { success: false, error: t("medActUpdate") };
  }
}

export async function deleteMeditation(id: string): Promise<ActionResult> {
  await requireAdmin();
  const t = await getTranslations("adminCatalog");

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: t("medActInvalidId") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("meditations").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catalog/meditations");
    return { success: true };
  } catch (err) {
    console.error("[deleteMeditation] error:", err);
    return { success: false, error: t("medActDelete") };
  }
}
