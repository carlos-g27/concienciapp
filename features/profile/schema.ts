import { z } from "zod";

// --- Esquema compartido de validación del perfil ---
// Reutilizable en la Server Action (servidor) y en la UI (cliente).
// Los valores llegan como strings desde el formulario; los vacíos se tratan
// como "sin valor" (undefined) para poder guardarlos como null.

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max).optional());

const optionalInt = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().int().min(min).max(max).optional());

const optionalNumber = (min: number, max: number) =>
  z.preprocess(emptyToUndefined, z.coerce.number().min(min).max(max).optional());

export const profileUpdateSchema = z.object({
  name: optionalText(80),
  phone: optionalText(30),
  goal: optionalText(120),
  age: optionalInt(1, 120),
  weight: optionalNumber(1, 500),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// --- Restricciones del avatar ---
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export const AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// Extensión segura derivada del tipo real validado (no del nombre del archivo).
export const AVATAR_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
