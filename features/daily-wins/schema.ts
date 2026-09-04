import { z } from "zod";

/** Máximo de victorias diarias por usuario. */
export const MAX_DAILY_WINS = 5;

// --- Esquema de validación de una victoria ---
// Reutilizable en la Server Action (servidor) y en la UI (cliente).
export const winLabelSchema = z
  .string()
  .trim()
  .min(1, "Escribe una victoria.")
  .max(80, "Máximo 80 caracteres.");

export type WinLabelInput = z.infer<typeof winLabelSchema>;
