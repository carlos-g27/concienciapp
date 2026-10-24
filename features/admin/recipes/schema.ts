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

// --- Calorías: solo números enteros, máximo 5 dígitos (0–99999) ---
export const CALORIES_MAX_DIGITS = 5;

/** Deja solo los números (sin letras ni símbolos), hasta 5 dígitos. */
export const onlyCalorieDigits = (value: string) =>
  value.replace(/\D/g, "").slice(0, CALORIES_MAX_DIGITS);

const INGREDIENT_INCOMPLETE = "Completa el ingrediente y la cantidad en todas las filas.";

/** Fila a medio llenar: tiene ingrediente o cantidad, pero no ambos. */
export const isIncompleteIngredient = (row: { name: string; quantity: string }) =>
  Boolean(row.name.trim()) !== Boolean(row.quantity.trim());

const emptyToUndefined = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "") ? undefined : v;

// --- Esquema de validación de una receta del catálogo ---
export const recipeSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  calories: z.coerce
    .number()
    .int("Las calorías deben ser un número entero")
    .min(0, "Las calorías no pueden ser negativas")
    .max(99999, "Las calorías tienen máximo 5 dígitos"),
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
            // Las filas totalmente vacías se ignoran; las incompletas dan error.
            .filter((i) => i.name || i.quantity)
        : [],
    z
      .array(
        z.object({
          name: z.string().min(1, INGREDIENT_INCOMPLETE).max(200),
          quantity: z.string().min(1, INGREDIENT_INCOMPLETE).max(100),
        }),
      )
      .max(100),
  ),
});

export type RecipeInput = z.infer<typeof recipeSchema>;
