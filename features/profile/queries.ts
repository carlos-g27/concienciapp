import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserProfileData } from "./types";

/**
 * Lectura server-side del perfil del usuario.
 *
 * Normaliza los campos a strings (vacío en vez de null) para alimentar el
 * formulario. El `email` cae al email de auth si el perfil no lo tiene.
 */
export async function getProfile(userId: string): Promise<UserProfileData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("name, email, phone, age, weight, goal, avatar_url")
    .eq("id", userId)
    .single();

  return {
    name: data?.name ?? "",
    email: data?.email ?? user?.email ?? "",
    phone: data?.phone ?? "",
    age: data?.age != null ? String(data.age) : "",
    weight: data?.weight != null ? String(data.weight) : "",
    goal: data?.goal ?? "",
    avatar_url: data?.avatar_url ?? "",
  };
}
