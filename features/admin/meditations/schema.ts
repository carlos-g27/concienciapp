import { z } from "zod";
import { getYoutubeId } from "@/lib/youtube";

/** Forma cruda que envía el formulario (antes de validar/coercer). */
export interface MeditationFormInput {
  name: string;
  category: string;
  videoUrl: string;
  duration: string | number;
}

// --- Esquema de validación de una meditación del catálogo ---
export const meditationSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  category: z.string().trim().min(1, "La categoría es obligatoria").max(80),
  videoUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => getYoutubeId(v) !== null, "El link debe ser un video de YouTube válido"),
  duration: z.coerce
    .number()
    .int("La duración debe ser un número entero de minutos")
    .min(1, "La duración debe ser de al menos 1 minuto")
    .max(600, "La duración no puede superar 600 minutos"),
});

export type MeditationInput = z.infer<typeof meditationSchema>;
