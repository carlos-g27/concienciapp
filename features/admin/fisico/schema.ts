import { z } from "zod";

const dayEnum = z.enum(["lunes", "martes", "miercoles", "jueves", "viernes"]);

// --- Validación del guardado de rutina ---
export const saveRoutineSchema = z.object({
  routine: z
    .array(
      z.object({
        exerciseId: z.string().uuid(),
        day: dayEnum,
        sets: z.coerce.number().int().min(1).max(100),
        reps: z.coerce.number().int().min(1).max(1000),
      }),
    )
    .max(500),
  focus: z
    .array(
      z.object({
        day: dayEnum,
        focus: z.string().trim().max(200),
      }),
    )
    .max(7),
});

export type SaveRoutineInput = z.infer<typeof saveRoutineSchema>;
