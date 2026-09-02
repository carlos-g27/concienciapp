import { z } from "zod";
import type { MealType } from "./types";

/** Forma cruda que envía el formulario (antes de validar/coercer). */
export interface RecipeFormInput {
  name: string;
  calories: string | number;
  imageUrl: string;
  mealType: MealType;
  ingredients: { name: string; quantity: string }[];
}

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

// --- Esquema de validación de una receta del catálogo ---
export const recipeSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  calories: z.coerce.number().min(0, "Las calorías no pueden ser negativas").max(100000),
  imageUrl: z.preprocess(
    emptyToUndefined,
    z.string().trim().url("La URL de imagen no es válida").max(500).optional(),
  ),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  ingredients: z.preprocess(
    (v) =>
      Array.isArray(v)
        ? v
            .map((i) => ({
              name: typeof i?.name === "string" ? i.name.trim() : "",
              quantity: typeof i?.quantity === "string" ? i.quantity.trim() : "",
            }))
            .filter((i) => i.name)
        : [],
    z.array(z.object({ name: z.string().max(200), quantity: z.string().max(100) })).max(100),
  ),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
