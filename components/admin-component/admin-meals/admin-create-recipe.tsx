"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import styles from "./admin-create-recipe.module.css";

// --- Tipos ---
type MealType = "breakfast" | "lunch" | "dinner";

interface IngredientRow {
  id: string;
  name: string;
  quantity: string;
}

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch",     label: "Almuerzo" },
  { value: "dinner",    label: "Cena" },
];

function isMealType(value: string | null): value is MealType {
  return value === "breakfast" || value === "lunch" || value === "dinner";
}

export default function AdminCreateRecipe() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id");
  const typeParam = searchParams.get("type");
  const isEditMode = Boolean(recipeId);

  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [mealType, setMealType] = useState<MealType>(isMealType(typeParam) ? typeParam : "breakfast");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { id: crypto.randomUUID(), name: "", quantity: "" },
  ]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // --- Modo edición: precargar receta + ingredientes ---
  useEffect(() => {
    if (!recipeId) return;

    const fetchRecipe = async () => {
      try {
        const [{ data: recipeData, error: recipeError }, { data: ingredientsData, error: ingredientsError }] =
          await Promise.all([
            supabase.from("recipes").select("name, calories, image_url, meal_type").eq("id", recipeId).single(),
            supabase.from("recipe_ingredients").select("id, name, quantity").eq("recipe_id", recipeId),
          ]);

        if (recipeError) throw recipeError;
        if (ingredientsError) throw ingredientsError;

        if (recipeData) {
          setName(recipeData.name ?? "");
          setCalories(String(recipeData.calories ?? ""));
          setImageUrl(recipeData.image_url ?? "");
          if (isMealType(recipeData.meal_type)) setMealType(recipeData.meal_type);
        }

        if (ingredientsData && ingredientsData.length > 0) {
          setIngredients(
            ingredientsData.map((row) => ({ id: row.id, name: row.name, quantity: row.quantity }))
          );
        }
      } catch (err) {
        console.error("Error cargando receta:", err);
        setError("No se pudo cargar la receta a editar.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // --- Ingredientes dinámicos ---
  const addIngredient = () => {
    setIngredients((prev) => [...prev, { id: crypto.randomUUID(), name: "", quantity: "" }]);
  };

  const updateIngredient = (id: string, field: "name" | "quantity", value: string) => {
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  // --- Guardar receta ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !calories.trim()) {
      setError("El nombre y las calorías son obligatorios.");
      return;
    }

    setIsSaving(true);

    try {
      const recipePayload = {
        name: name.trim(),
        calories: Number(calories) || 0,
        image_url: imageUrl.trim() || null,
        meal_type: mealType,
      };

      const cleanIngredients = ingredients.filter((i) => i.name.trim());

      let targetRecipeId = recipeId;

      if (isEditMode && recipeId) {
        const { error: updateError } = await supabase
          .from("recipes")
          .update(recipePayload)
          .eq("id", recipeId);
        if (updateError) throw updateError;

        // Reemplazo completo de ingredientes
        const { error: deleteError } = await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", recipeId);
        if (deleteError) throw deleteError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("recipes")
          .insert(recipePayload)
          .select("id")
          .single();
        if (insertError) throw insertError;
        targetRecipeId = inserted.id;
      }

      if (cleanIngredients.length > 0 && targetRecipeId) {
        const { error: ingredientsError } = await supabase.from("recipe_ingredients").insert(
          cleanIngredients.map((i) => ({
            recipe_id: targetRecipeId,
            name: i.name.trim(),
            quantity: i.quantity.trim(),
          }))
        );
        if (ingredientsError) throw ingredientsError;
      }

      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la receta.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>

      <Link href="#" onClick={(e) => { e.preventDefault(); router.back(); }} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </Link>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {isEditMode ? "Editar receta" : "Crear nueva receta"}
        </h1>
        <p className={styles.pageSubtitle}>
          {isEditMode
            ? "Los cambios se aplicarán a todos los usuarios que tengan esta receta asignada"
            : "Esta receta quedará disponible en el catálogo global"}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className={styles.loadingText}>Cargando receta...</p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Preview de imagen */}
              <div className={styles.imagePreview}>
                {imageUrl && !imgError ? (
                  <img
                    src={imageUrl}
                    alt={name || "Vista previa"}
                    onError={() => setImgError(true)}
                    className={styles.imagePreviewImg}
                  />
                ) : (
                  <div className={styles.imagePreviewPlaceholder}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Nombre + Calorías */}
              <div className={styles.row}>
                <div className={styles.field} style={{ flex: 1 }}>
                  <Label htmlFor="name">Nombre de la receta</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Bowl de Avena con Frutas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field} style={{ width: 140 }}>
                  <Label htmlFor="calories">Calorías (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    placeholder="420"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tipo de comida */}
              <div className={styles.field}>
                <Label htmlFor="mealType">Tipo de comida</Label>
                <select
                  id="mealType"
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className={styles.select}
                >
                  {MEAL_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* URL de imagen */}
              <div className={styles.field}>
                <Label htmlFor="image">URL de imagen</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
                />
              </div>

              {/* Ingredientes */}
              <div className={styles.field}>
                <div className={styles.ingredientsHeader}>
                  <Label>Ingredientes</Label>
                  <span className={styles.ingredientsCount}>{ingredients.length} ítems</span>
                </div>

                <div className={styles.ingredientsTable}>
                  <div className={styles.ingredientsTableHead}>
                    <span>Ingrediente</span>
                    <span>Cantidad</span>
                    <span />
                  </div>
                  {ingredients.map((ing) => (
                    <div key={ing.id} className={styles.ingredientRow}>
                      <input
                        type="text"
                        placeholder="ej. Avena"
                        value={ing.name}
                        onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                        className={styles.ingredientInput}
                      />
                      <input
                        type="text"
                        placeholder="ej. 200 g"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(ing.id, "quantity", e.target.value)}
                        className={styles.ingredientInput}
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing.id)}
                        className={styles.ingredientRemoveBtn}
                        aria-label="Quitar ingrediente"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addIngredient} className={styles.addIngredientBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Añadir ingrediente
                </button>
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <Button type="submit" disabled={isSaving} className={styles.submitBtn}>
                {isSaving
                  ? isEditMode ? "Guardando..." : "Creando..."
                  : isEditMode ? "Guardar cambios" : "Crear receta"}
              </Button>

            </form>
          )}
        </CardContent>
      </Card>

    </div>
  );
}