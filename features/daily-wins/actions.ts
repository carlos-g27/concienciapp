"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { saveWinsSchema, MAX_DAILY_WINS, type SaveWinsInput } from "./schema";
import { appToday } from "./queries";
import type { DailyWin } from "./types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface SaveWinsResult extends ActionResult {
  /** Lista guardada (con los ids generados para las nuevas). */
  wins?: DailyWin[];
}

const idSchema = z.string().uuid();

/**
 * Guarda la lista completa de victorias del usuario autenticado comparándola
 * con la de la base: elimina las quitadas, actualiza las editadas e inserta las
 * nuevas. Las existentes conservan su id, así no se pierde su historial
 * (daily_win_logs cae por ON DELETE CASCADE solo en las eliminadas).
 */
export async function saveWins(input: SaveWinsInput): Promise<SaveWinsResult> {
  const user = await requireUser();
  const t = await getTranslations("victorias");

  const parsed = saveWinsSchema.safeParse(input);
  if (!parsed.success) {
    const tooMany = parsed.error.issues.some((i) => i.code === "too_big" && i.path.length === 1);
    return {
      success: false,
      error: tooMany ? t("errLimit", { max: MAX_DAILY_WINS }) : t("errInvalid"),
    };
  }

  try {
    const supabase = await createClient();

    const { data: current, error: readErr } = await supabase
      .from("daily_wins")
      .select("id, label")
      .eq("user_id", user.id);
    if (readErr) throw readErr;

    const existing = new Map((current ?? []).map((w) => [w.id as string, w.label as string]));
    const wins = parsed.data.wins;

    // Un id que no sea del usuario no se acepta (defensa en profundidad).
    if (wins.some((w) => w.id && !existing.has(w.id))) {
      return { success: false, error: t("errInvalid") };
    }

    const keptIds = new Set(wins.map((w) => w.id).filter(Boolean));
    const toDelete = [...existing.keys()].filter((id) => !keptIds.has(id));

    if (toDelete.length > 0) {
      const { error } = await supabase
        .from("daily_wins")
        .delete()
        .in("id", toDelete)
        .eq("user_id", user.id);
      if (error) throw error;
    }

    for (const w of wins) {
      if (w.id && existing.get(w.id) !== w.label) {
        const { error } = await supabase
          .from("daily_wins")
          .update({ label: w.label })
          .eq("id", w.id)
          .eq("user_id", user.id);
        if (error) throw error;
      }
    }

    // Una por una para conservar el orden por created_at.
    for (const w of wins) {
      if (!w.id) {
        const { error } = await supabase
          .from("daily_wins")
          .insert({ user_id: user.id, label: w.label });
        if (error) throw error;
      }
    }

    const { data: saved, error: savedErr } = await supabase
      .from("daily_wins")
      .select("id, label")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (savedErr) throw savedErr;

    revalidatePath("/victorias");
    revalidatePath("/dashboard");
    return { success: true, wins: (saved ?? []) as DailyWin[] };
  } catch (err) {
    console.error("[saveWins] error:", err);
    return { success: false, error: t("errSave") };
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
