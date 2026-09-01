import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

// --- Validación de la edición de un usuario (campos permitidos al admin) ---
export const userUpdateSchema = z.object({
  weight: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(500).optional()),
  age: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(120).optional()),
  goal: z.preprocess(emptyToUndefined, z.string().trim().max(120).optional()),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/** Forma cruda que envía el formulario (strings). */
export interface UserUpdateFormInput {
  weight: string;
  age: string;
  goal: string;
}
