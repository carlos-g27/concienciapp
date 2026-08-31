import { z } from "zod";

// --- Esquema de validación para registrar un peso ---
export const addWeightLogSchema = z.object({
  exerciseId: z.string().uuid(),
  weight: z.coerce.number().positive().max(1000),
  isRm: z.coerce.boolean().optional().default(false),
});

export type AddWeightLogInput = z.infer<typeof addWeightLogSchema>;
