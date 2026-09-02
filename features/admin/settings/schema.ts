import { z } from "zod";

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

export const pilarToggleSchema = z.object({
  key: z.enum(["fisico", "nutricion", "mental"]),
  enabled: z.coerce.boolean(),
});

export const adminProfileSchema = z.object({
  name: z.preprocess(emptyToUndefined, z.string().trim().max(80).optional()),
  email: z.string().trim().email("Correo inválido").max(255),
});

export type AdminProfileInput = z.infer<typeof adminProfileSchema>;

/** Forma cruda del formulario de perfil admin. */
export interface AdminProfileFormInput {
  name: string;
  email: string;
}
