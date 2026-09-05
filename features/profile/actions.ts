"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import {
  profileUpdateSchema,
  AVATAR_MAX_BYTES,
  AVATAR_ALLOWED_TYPES,
  AVATAR_EXT_BY_TYPE,
} from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
  avatarUrl?: string;
}

/**
 * Actualiza los datos del perfil del usuario autenticado.
 * El usuario se deriva de la sesión en servidor (nunca del cliente) y los
 * datos se validan con el esquema compartido antes de escribir.
 */
export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("profile");

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    goal: formData.get("goal"),
    age: formData.get("age"),
    weight: formData.get("weight"),
  });

  if (!parsed.success) {
    return { success: false, error: t("errInvalid") };
  }

  const { name, phone, goal, age, weight } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        name: name ?? null,
        phone: phone ?? null,
        goal: goal ?? null,
        age: age ?? null,
        weight: weight ?? null,
      })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.error("[updateProfile] error:", err);
    return { success: false, error: t("errSaveProfile") };
  }
}

/**
 * Sube el avatar del usuario autenticado a Storage y guarda su URL.
 * Valida tipo y tamaño reales en el servidor; la extensión se deriva del tipo
 * validado (no del nombre del archivo enviado por el cliente).
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("profile");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: t("errNoImage") };
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return { success: false, error: t("errFormat") };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { success: false, error: t("errImageSize") };
  }

  try {
    const supabase = await createClient();
    const ext = AVATAR_EXT_BY_TYPE[file.type];
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    return { success: true, avatarUrl: publicUrl };
  } catch (err) {
    console.error("[uploadAvatar] error:", err);
    return { success: false, error: t("errAvatarUpload") };
  }
}
