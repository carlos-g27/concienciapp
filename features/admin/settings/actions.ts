"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { pilarToggleSchema, adminProfileSchema, type AdminProfileFormInput } from "./schema";
import type { PilarKey } from "./types";

export interface ActionResult {
  success: boolean;
  error?: string;
  emailPending?: boolean;
}

/** Activa/desactiva un pilar (disponibilidad global). */
export async function togglePilar(key: PilarKey, enabled: boolean): Promise<ActionResult> {
  await requireAdmin();

  const parsed = pilarToggleSchema.safeParse({ key, enabled });
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("pilar_settings")
      .update({ enabled: parsed.data.enabled, updated_at: new Date().toISOString() })
      .eq("pilar_key", parsed.data.key);

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    console.error("[togglePilar] error:", err);
    return { success: false, error: "No se pudo actualizar el pilar." };
  }
}

/**
 * Actualiza el perfil del admin en sesión: nombre en `profiles`; si el correo
 * cambió, dispara el flujo de confirmación de Supabase (`auth.updateUser`).
 */
export async function updateAdminProfile(input: AdminProfileFormInput): Promise<ActionResult> {
  const user = await requireAdmin();

  const parsed = adminProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { name, email } = parsed.data;

  try {
    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: name ?? null })
      .eq("id", user.id);
    if (updateError) throw updateError;

    let emailPending = false;
    if (email !== (user.email ?? "")) {
      const { error: emailError } = await supabase.auth.updateUser({ email });
      if (emailError) throw emailError;
      emailPending = true;
    }

    revalidatePath("/admin/settings/profile");
    return { success: true, emailPending };
  } catch (err) {
    console.error("[updateAdminProfile] error:", err);
    return { success: false, error: "No se pudo guardar el perfil." };
  }
}
