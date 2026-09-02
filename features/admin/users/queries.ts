import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminUserCounts, AdminUserDetail } from "./types";

export interface UserDetailResult {
  profile: AdminUserDetail;
  counts: AdminUserCounts;
}

/**
 * Lectura server-side del detalle de un usuario: su perfil + conteos de
 * asignaciones (rutinas, comidas, meditaciones). Devuelve null si no existe.
 */
export async function getUserDetail(userId: string): Promise<UserDetailResult | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, weight, age, goal, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const [
    { count: exercisesCount },
    { count: recipesCount },
    { count: meditationsCount },
  ] = await Promise.all([
    supabase.from("user_routines").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("user_meals").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("user_meditations").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    profile: {
      id: data.id,
      name: data.name ?? "Sin nombre",
      email: data.email ?? "",
      weight: data.weight != null ? String(data.weight) : "",
      age: data.age != null ? String(data.age) : "",
      goal: data.goal ?? "",
      avatar_url: data.avatar_url,
    },
    counts: {
      exercises: exercisesCount ?? 0,
      recipes: recipesCount ?? 0,
      meditations: meditationsCount ?? 0,
    },
  };
}
