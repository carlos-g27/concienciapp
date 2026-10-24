import { z } from "zod";
import { profileUpdateSchema } from "@/features/profile/schema";

// --- Validación de la edición de un usuario (campos permitidos al admin) ---
// Mismos límites que "Mi perfil" del usuario.
export const userUpdateSchema = profileUpdateSchema.pick({ weight: true, age: true, goal: true });

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

/** Forma cruda que envía el formulario (strings). */
export interface UserUpdateFormInput {
  weight: string;
  age: string;
  goal: string;
}
