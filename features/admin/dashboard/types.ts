// --- Tipos del dashboard de administración ---

export interface AdminUserRow {
  id: string;
  name: string | null;
  email: string | null;
  weight: number | string | null;
  goal: string | null;
  avatar_url: string | null;
  created_at: string;
  has_routine: boolean;
}
