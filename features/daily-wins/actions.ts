"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { winLabelSchema, MAX_DAILY_WINS } from "./schema";
import { appToday } from "./queries";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface AddWinResult extends ActionResult {
  id?: string;
}

const idSchema = z.string().uuid();

/**
 * Crea una victoria para el usuario autenticado. Devuelve el id generado para
 * que la UI pueda reflejar el cambio sin recargar.
 */
export async function addWin(label: string): Promise<AddWinResult> {
  const user = await requireUser();
  const t = await getTranslations("victorias");

  const parsed = winLabelSchema.safeParse(label);
  if (!parsed.success) {
    return { success: false, error: t("errInvalid") };
  }

  try {
    const supabase = await createClient();

    // Tope de victorias por usuario (barrera autoritativa en servidor).
    const { count, error: countErr } = await supabase
      .from("daily_wins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (countErr) throw countErr;
    if ((count ?? 0) >= MAX_DAILY_WINS) {
      return { success: false, error: t("errLimit", { max: MAX_DAILY_WINS }) };
    }

    const { data, error } = await supabase
      .from("daily_wins")
      .insert({ user_id: user.id, label: parsed.data })
      .select("id")
      .single();
    if (error) throw error;

    revalidatePath("/victorias");
    revalidatePath("/dashboard");
    return { success: true, id: data.id as string };
  } catch (err) {
    console.error("[addWin] error:", err);
    return { success: false, error: t("errAdd") };
  }
}

/**
 * Actualiza el texto de una victoria del usuario autenticado.
 */
export async function updateWin(id: string, label: string): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("victorias");

  if (!idSchema.safeParse(id).success) {
    return { success: false, error: t("errInvalid") };
  }

  const parsed = winLabelSchema.safeParse(label);
  if (!parsed.success) {
    return { success: false, error: t("errInvalid") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_wins")
      .update({ label: parsed.data })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/victorias");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[updateWin] error:", err);
    return { success: false, error: t("errUpdate") };
  }
}

/**
 * Elimina una victoria del usuario autenticado (los logs asociados caen por
 * ON DELETE CASCADE).
 */
export async function deleteWin(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("victorias");

  if (!idSchema.safeParse(id).success) {
    return { success: false, error: t("errInvalid") };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("daily_wins")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;

    revalidatePath("/victorias");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[deleteWin] error:", err);
    return { success: false, error: t("errDelete") };
  }
}

/**
 * Marca o desmarca una victoria para HOY.
 *  - marcar   → inserta la fila del día (idempotente por unique(win_id, date)).
 *  - desmarcar → borra la fila del día.
 * La fecha se resuelve en el servidor (appToday, America/Bogota).
 */
export async function toggleWinToday(winId: string, completed: boolean): Promise<ActionResult> {
  const user = await requireUser();
  const t = await getTranslations("victorias");

  if (!idSchema.safeParse(winId).success) {
    return { success: false, error: t("errInvalid") };
  }

  try {
    const supabase = await createClient();

    // Defensa en profundidad: la victoria debe pertenecer al usuario.
    const { data: win, error: ownErr } = await supabase
      .from("daily_wins")
      .select("id")
      .eq("id", winId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownErr) throw ownErr;
    if (!win) return { success: false, error: t("errInvalid") };

    const today = appToday();

    if (completed) {
      const { error } = await supabase
        .from("daily_win_logs")
        .upsert(
          { win_id: winId, user_id: user.id, date: today, completed: true },
          { onConflict: "win_id,date" },
        );
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("daily_win_logs")
        .delete()
        .eq("win_id", winId)
        .eq("user_id", user.id)
        .eq("date", today);
      if (error) throw error;
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[toggleWinToday] error:", err);
    return { success: false, error: t("errToggle") };
  }
}
