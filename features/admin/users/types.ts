// --- Tipos del detalle de usuario (admin) ---

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  weight: string;
  age: string;
  goal: string;
  avatar_url: string | null;
}

export interface AdminUserCounts {
  exercises: number;
  recipes: number;
  meditations: number;
}
