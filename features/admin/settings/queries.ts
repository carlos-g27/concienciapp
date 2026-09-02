import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminOwnProfile, PilarKey, PilarSettingItem } from "./types";

const PILAR_KEYS: PilarKey[] = ["fisico", "nutricion", "mental"];

/** Estado de disponibilidad de los pilares (default: habilitado si falta la fila). */
export async function getPilarSettingsAdmin(): Promise<PilarSettingItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("pilar_settings").select("pilar_key, enabled");

  return PILAR_KEYS.map((key) => ({
    key,
    enabled: data?.find((d) => d.pilar_key === key)?.enabled ?? true,
  }));
}

/** Perfil del admin en sesión. */
export async function getAdminOwnProfile(): Promise<AdminOwnProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    name: data?.name ?? "",
    email: data?.email ?? user.email ?? "",
    avatar_url: data?.avatar_url ?? null,
  };
}
