// --- Tipos del dominio Perfil ---

/** Datos del perfil que consume la UI. Strings vacíos en vez de null para el form. */
export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  age: string;
  weight: string;
  goal: string;
  avatar_url: string;
}
