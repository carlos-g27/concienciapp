import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminUserRow } from "./types";

interface RawProfile {
  id: string;
  name: string | null;
  email: string | null;
  weight: number | string | null;
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
}

/**
 * Lectura server-side de los usuarios (role=user) con la marca `has_routine`
 * (si tienen filas en `user_routines`). Ordenados por creación descendente.
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, email, weight, goal, avatar_url, created_at")
    .eq("role", "user")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!profiles) return [];

  const { data: routines } = await supabase.from("user_routines").select("user_id");
  const usersWithRoutine = new Set((routines ?? []).map((r) => r.user_id));

  return (profiles as RawProfile[]).map((p) => ({
    ...p,
    has_routine: usersWithRoutine.has(p.id),
  }));
}
