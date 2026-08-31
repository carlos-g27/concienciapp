// --- Tipos del shell de usuario (sidebar) ---

export interface ShellProfile {
  name: string;
  email: string;
  avatar_url: string;
}

export interface ShellPilares {
  fisico: boolean;
  nutricion: boolean;
  mental: boolean;
}

export interface ShellData {
  profile: ShellProfile;
  pilares: ShellPilares;
}
