// --- Tipos del dominio Victorias diarias ---

/** Una victoria del catálogo personal del usuario. */
export interface DailyWin {
  id: string;
  label: string;
}

/** Victoria con su estado de cumplimiento del día de hoy. */
export interface WinToday {
  id: string;
  label: string;
  completed: boolean;
}

/** Datos que consume el card "Victorias de hoy" del dashboard. */
export interface TodayWins {
  wins: WinToday[];
  /** % de victorias completadas hoy (0–100). */
  percent: number;
}
