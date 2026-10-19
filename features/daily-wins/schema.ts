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

// --- Guardado de la lista completa de victorias ---
// Las victorias existentes llevan su id (se actualizan y conservan su historial);
// las nuevas van sin id.
export const saveWinsSchema = z.object({
  wins: z
    .array(z.object({ id: z.string().uuid().optional(), label: winLabelSchema }))
    .max(MAX_DAILY_WINS),
});

export type SaveWinsInput = z.infer<typeof saveWinsSchema>;
