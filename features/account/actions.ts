"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Elimina la cuenta del usuario autenticado (usuario o admin) y TODOS sus
 * datos: foto de perfil en Storage, filas de cada tabla y la cuenta en
 * auth.users (función SQL `delete_my_account`, atómica). Si todo sale bien,
 * cierra la sesión y redirige al login.
 */
export async function deleteMyAccount(): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("deleteAccount");
  const supabase = await createClient();

  try {
    // 1) Comprobar ANTES de borrar nada (p. ej. único admin).
    const { data: check, error: checkErr } = await supabase.rpc("can_delete_my_account");
    if (checkErr) throw checkErr;
    if (check === "last_admin") return { success: false, error: t("errLastAdmin") };
    if (check !== "ok") return { success: false, error: t("errGeneric") };

    // 2) Foto(s) de perfil: avatars/<uid>/… (Storage no se puede borrar desde SQL).
    const { data: files, error: listErr } = await supabase.storage.from("avatars").list(user.id);
    if (listErr) throw listErr;
    if (files && files.length > 0) {
      const paths = files.map((f) => `${user.id}/${f.name}`);
      const { data: removed, error: removeErr } = await supabase.storage.from("avatars").remove(paths);
      if (removeErr) throw removeErr;
      // Sin permiso de borrado, Storage responde OK pero sin borrar nada.
      if ((removed ?? []).length !== paths.length) {
        throw new Error("No se pudo borrar la foto de perfil (¿falta la política de borrado?)");
      }
    }

    // 3) Datos y cuenta, en una sola transacción.
    const { error: deleteErr } = await supabase.rpc("delete_my_account");
    if (deleteErr) {
      if (deleteErr.message === "last_admin") return { success: false, error: t("errLastAdmin") };
      throw deleteErr;
    }
  } catch (err) {
    console.error("[deleteMyAccount] error:", err);
    return { success: false, error: t("errGeneric") };
  }

  // La cuenta ya no existe: limpiar las cookies de sesión.
  await supabase.auth.signOut();
  redirect("/auth/login?deleted=1");
}
