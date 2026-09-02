"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { saveRoutineSchema } from "./schema";
import type { Day } from "./types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/** Forma cruda que envía la vista (sets/reps ya numéricos). */
export interface SaveRoutineFormInput {
  routine: { exerciseId: string; day: Day; sets: number; reps: number }[];
  focus: { day: Day; focus: string }[];
}

/**
 * Reemplaza la rutina completa de un usuario de forma ATÓMICA vía la RPC
 * `replace_user_routine` (delete + insert + upsert en una transacción).
 */
export async function saveUserRoutine(
  userId: string,
  input: SaveRoutineFormInput,
): Promise<ActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(userId).success) {
    return { success: false, error: "Usuario inválido." };
  }

  const parsed = saveRoutineSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos de rutina inválidos." };
  }

  try {
    const supabase = await createClient();

    const p_routine = parsed.data.routine.map((r) => ({
      exercise_id: r.exerciseId,
      day: r.day,
      sets: r.sets,
      reps: r.reps,
    }));

    const { error } = await supabase.rpc("replace_user_routine", {
      p_user_id: userId,
      p_routine: p_routine,
      p_focus: parsed.data.focus,
    });

    if (error) throw error;

    revalidatePath(`/admin/users/${userId}/fisico`);
    return { success: true };
  } catch (err) {
    console.error("[saveUserRoutine] error:", err);
    return { success: false, error: "No se pudo guardar la rutina." };
  }
}
