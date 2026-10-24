"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { userUpdateSchema, type UserUpdateFormInput } from "./schema";
import { PROFILE_FIELD_ERROR_KEYS, invalidProfileFields } from "@/features/profile/schema";

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
    const tp = await getTranslations("profile");
    const invalid = invalidProfileFields(parsed);
    return {
      success: false,
      error: invalid.length > 0 ? invalid.map((f) => tp(PROFILE_FIELD_ERROR_KEYS[f])).join("\n") : t("actUserInvalidData"),
    };
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

/**
 * El admin elimina la cuenta de un usuario y TODOS sus datos: foto en Storage,
 * filas de cada tabla y la cuenta en auth.users (función SQL
 * `admin_delete_user`, atómica). Exige escribir el correo del usuario.
 * No permite borrarse a uno mismo ni a otro admin.
 */
export async function adminDeleteUser(userId: string, typedEmail: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const t = await getTranslations("adminDeleteUser");

  if (!z.string().uuid().safeParse(userId).success) {
    return { success: false, error: t("errNotFound") };
  }
  if (userId === admin.id) {
    return { success: false, error: t("errSelf") };
  }

  const supabase = await createClient();

  try {
    // 1) Comprobaciones ANTES de borrar nada.
    const { data: target, error: targetErr } = await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", userId)
      .maybeSingle();
    if (targetErr) throw targetErr;
    if (!target) return { success: false, error: t("errNotFound") };
    if (target.role === "admin") return { success: false, error: t("errTargetAdmin") };
    if ((target.email ?? "").trim().toLowerCase() !== typedEmail.trim().toLowerCase()) {
      return { success: false, error: t("errEmailMismatch") };
    }

    // 2) Foto(s) de perfil del usuario: avatars/<uid>/…
    const { data: files, error: listErr } = await supabase.storage.from("avatars").list(userId);
    if (listErr) throw listErr;
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      const { data: removed, error: removeErr } = await supabase.storage.from("avatars").remove(paths);
      if (removeErr) throw removeErr;
      // Sin permiso de borrado, Storage responde OK pero sin borrar nada.
      if ((removed ?? []).length !== paths.length) {
        throw new Error("No se pudo borrar la foto de perfil (¿falta la política de borrado del admin?)");
      }
    }

    // 3) Datos y cuenta, en una sola transacción.
    const { error: deleteErr } = await supabase.rpc("admin_delete_user", { p_user_id: userId });
    if (deleteErr) {
      if (deleteErr.message === "target_is_admin") return { success: false, error: t("errTargetAdmin") };
      if (deleteErr.message === "self") return { success: false, error: t("errSelf") };
      if (deleteErr.message === "not_found") return { success: false, error: t("errNotFound") };
      throw deleteErr;
    }
  } catch (err) {
    console.error("[adminDeleteUser] error:", err);
    return { success: false, error: t("errGeneric") };
  }

  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}
