import { z } from "zod";

// --- Validación del guardado del plan de comidas ---
export const saveMealsSchema = z.object({
  recipeIds: z.array(z.string().uuid()).max(500),
});

export type SaveMealsInput = z.infer<typeof saveMealsSchema>;
