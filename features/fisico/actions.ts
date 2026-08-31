"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { addWeightLogSchema, type AddWeightLogInput } from "./schema";
import type { WeightLog } from "./types";

export interface WeightLogResult {
  success: boolean;
  error?: string;
  log?: WeightLog;
}

function mapLog(row: { id: string; weight: number | string; created_at: string; is_rm: boolean | null }): WeightLog {
  return {
    id: row.id,
    weight: Number(row.weight),
    date: row.created_at,
    is_rm: row.is_rm ?? false,
  };
}

/**
 * Historial de pesos del usuario autenticado para un ejercicio.
 * Devuelve [] ante error (detalle en logs de servidor).
 */
export async function listWeightLogs(exerciseId: string): Promise<WeightLog[]> {
  const user = await requireUser();

  if (!z.string().uuid().safeParse(exerciseId).success) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("weight_logs")
      .select("id, weight, created_at, is_rm")
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapLog);
  } catch (err) {
    console.error("[listWeightLogs] error:", err);
    return [];
  }
}

/**
 * Inserta un registro de peso para el usuario autenticado.
 * El user_id se deriva de la sesión (nunca del cliente) y la entrada se valida.
 */
export async function addWeightLog(input: AddWeightLogInput): Promise<WeightLogResult> {
  const user = await requireUser();

  const parsed = addWeightLogSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos." };
  }
  const { exerciseId, weight, isRm } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("weight_logs")
      .insert({
        user_id: user.id,
        exercise_id: exerciseId,
        weight,
        is_rm: isRm,
      })
      .select("id, weight, created_at, is_rm")
      .single();

    if (error) throw error;
    return { success: true, log: mapLog(data) };
  } catch (err) {
    console.error("[addWeightLog] error:", err);
    return { success: false, error: "No se pudo guardar el peso." };
  }
}

/**
 * Borra un registro de peso. Filtra por id Y user_id (defensa en profundidad:
 * un usuario solo puede borrar sus propios registros).
 */
export async function deleteWeightLog(logId: string): Promise<{ success: boolean; error?: string }> {
  const user = await requireUser();

  if (!z.string().uuid().safeParse(logId).success) {
    return { success: false, error: "Registro inválido." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("weight_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("[deleteWeightLog] error:", err);
    return { success: false, error: "No se pudo eliminar el registro." };
  }
}
