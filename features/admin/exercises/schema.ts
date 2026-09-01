import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

// --- Esquema de validación de un ejercicio del catálogo ---
export const exerciseSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  muscle: z.string().trim().min(1, "El grupo muscular es obligatorio").max(120),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(2000).optional()),
  instructions: z.preprocess(
    (v) =>
      Array.isArray(v)
        ? v.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean)
        : [],
    z.array(z.string().max(500)).max(50),
  ),
  videoUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("La URL del video no es válida").max(500).optional(),
  ),
  isMainLift: z.coerce.boolean().optional().default(false),
});

export type ExerciseInput = z.infer<typeof exerciseSchema>;
