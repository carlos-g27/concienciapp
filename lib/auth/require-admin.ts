import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import type { User } from "@supabase/supabase-js";

/**
 * Frontera de autorización server-side para el área de administración.
 *
 * Exige sesión (vía `requireUser`) y además que `profiles.role === "admin"`.
 * Si no es admin, redirige a `/dashboard`. Devuelve el usuario admin.
 *
 * La protección de `proxy.ts` sigue actuando como primera barrera; esto añade
 * defensa en profundidad a nivel de página/acción de `/admin`.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}
