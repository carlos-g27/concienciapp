"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { exerciseSchema, type ExerciseInput } from "./schema";

export interface ActionResult {
  success: boolean;
  error?: string;
}

// Construye el payload de DB a partir de la entrada validada.
function toPayload(input: ExerciseInput) {
  return {
    name: input.name,
    muscle: input.muscle,
    description: input.description ?? null,
    instructions: input.instructions.length > 0 ? input.instructions : null,
    video_url: input.videoUrl ?? null,
    is_main_lift: input.isMainLift,
  };
}

export async function createExercise(input: ExerciseInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("exercises").insert(toPayload(parsed.data));
    if (error) throw error;

    revalidatePath("/admin/catalog/exercises");
    return { success: true };
  } catch (err) {
    console.error("[createExercise] error:", err);
    return { success: false, error: "No se pudo crear el ejercicio." };
  }
}

export async function updateExercise(id: string, input: ExerciseInput): Promise<ActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Ejercicio inválido." };
  }

  const parsed = exerciseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("exercises").update(toPayload(parsed.data)).eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catalog/exercises");
    return { success: true };
  } catch (err) {
    console.error("[updateExercise] error:", err);
    return { success: false, error: "No se pudo guardar el ejercicio." };
  }
}

export async function deleteExercise(id: string): Promise<ActionResult> {
  await requireAdmin();

  if (!z.string().uuid().safeParse(id).success) {
    return { success: false, error: "Ejercicio inválido." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("exercises").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/admin/catalog/exercises");
    return { success: true };
  } catch (err) {
    console.error("[deleteExercise] error:", err);
    return { success: false, error: "No se pudo eliminar el ejercicio." };
  }
}
