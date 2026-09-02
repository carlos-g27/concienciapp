// --- Tipos de la configuración de admin ---

export type PilarKey = "fisico" | "nutricion" | "mental";

export interface PilarSettingItem {
  key: PilarKey;
  enabled: boolean;
}

export interface AdminOwnProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}
