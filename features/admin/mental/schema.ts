import { z } from "zod";

// --- Validación del guardado de las meditaciones asignadas ---
export const saveMeditationsSchema = z.object({
  meditationIds: z.array(z.string().uuid()).max(500),
});

export type SaveMeditationsInput = z.infer<typeof saveMeditationsSchema>;
