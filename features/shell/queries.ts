import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/features/profile/queries";
import type { ShellData, ShellPilares } from "./types";

const defaultPilares: ShellPilares = { fisico: true, nutricion: true, mental: true };

/**
 * Lectura server-side de la disponibilidad de pilares (`pilar_settings`).
 * Si falta la fila de un pilar, se asume habilitado (mismo default que el
 * contexto cliente que reemplaza).
 */
export async function getPilarSettings(): Promise<ShellPilares> {
  const supabase = await createClient();

  const { data } = await supabase.from("pilar_settings").select("pilar_key, enabled");

  const pilares: ShellPilares = { ...defaultPilares };
  (data ?? []).forEach((row) => {
    if (row.pilar_key === "fisico") pilares.fisico = row.enabled;
    if (row.pilar_key === "nutricion") pilares.nutricion = row.enabled;
    if (row.pilar_key === "mental") pilares.mental = row.enabled;
  });

  return pilares;
}

/**
 * Datos que alimentan el shell (sidebar): perfil + disponibilidad de pilares.
 * Reutiliza `getProfile` (features/profile) para el perfil.
 */
export async function getShellData(userId: string): Promise<ShellData> {
  const [profile, pilares] = await Promise.all([getProfile(userId), getPilarSettings()]);

  return {
    profile: {
      name: profile.name,
      email: profile.email,
      avatar_url: profile.avatar_url,
    },
    pilares,
  };
}
