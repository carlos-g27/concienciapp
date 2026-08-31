import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Frontera de autorización server-side.
 *
 * Valida la sesión en el servidor con `auth.getUser()` (verifica el token
 * contra Supabase, no confía solo en la cookie). Si no hay usuario, redirige
 * a `/auth/login`. Devuelve el usuario autenticado.
 *
 * Base reutilizable para páginas server-first y Server Actions. La protección
 * de `proxy.ts` sigue actuando como primera barrera; esto añade defensa en
 * profundidad a nivel de página/acción.
 */
export async function requireUser(): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}
