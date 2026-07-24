"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminFormLayout from "@/components/layout/admin-form-layout";

type MealType = "breakfast" | "lunch" | "dinner";

interface IngredientRow {
  id: string;
  name: string;
  quantity: string;
}

const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Almuerzo" },
  { value: "dinner", label: "Cena" },
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

  const addIngredient = () => setIngredients((prev) => [...prev, { id: crypto.randomUUID(), name: "", quantity: "" }]);
  const updateIngredient = (id: string, field: "name" | "quantity", value: string) => setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  const removeIngredient = (id: string) => setIngredients((prev) => prev.filter((i) => i.id !== id));

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
    <AdminFormLayout
      title={isEditMode ? "Editar receta" : "Crear nueva receta"}
      subtitle={isEditMode ? "Los cambios se aplicarán a todos los usuarios que tengan esta receta asignada" : "Esta receta quedará disponible en el catálogo global"}
      isLoading={isLoading}
      isSaving={isSaving}
      loadingText="Cargando receta..."
      submitText={isEditMode ? "Guardar cambios" : "Crear receta"}
      error={error}
      onSubmit={handleSubmit}
    >
      {/* Preview de imagen */}
      <div className="w-full aspect-[16/7] rounded-2xl overflow-hidden bg-secondary">
        {imageUrl && !imgError ? (
          <img src={imageUrl} alt={name || "Vista previa"} onError={() => setImgError(true)} className="w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Nombre + Calorías */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="name">Nombre de la receta</Label>
          <Input id="name" type="text" placeholder="Bowl de Avena con Frutas" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-2 w-[140px]">
          <Label htmlFor="calories">Calorías (kcal)</Label>
          <Input id="calories" type="number" min="0" placeholder="420" value={calories} onChange={(e) => setCalories(e.target.value)} required />
        </div>
      </div>

      {/* Tipo de comida */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="mealType">Tipo de comida</Label>
        <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* URL de imagen */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="image">URL de imagen</Label>
        <Input id="image" type="url" placeholder="https://..." value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }} />
      </div>

      {/* Ingredientes */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Ingredientes</Label>
          <span className="text-xs text-muted-foreground">{ingredients.length} ítems</span>
        </div>

        <div className="border border-border rounded-xl overflow-hidden mt-1">
          <div className="grid grid-cols-[1fr_130px_32px] gap-2 px-3.5 py-2 bg-secondary border-b border-border">
            <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider">Ingrediente</span>
            <span className="text-[0.68rem] font-bold text-muted-foreground uppercase tracking-wider">Cantidad</span>
            <span />
          </div>
          {ingredients.map((ing) => (
            <div key={ing.id} className="grid grid-cols-[1fr_130px_32px] items-center gap-2 px-3.5 py-1 border-b border-border last:border-0">
              <input type="text" placeholder="ej. Avena" value={ing.name} onChange={(e) => updateIngredient(ing.id, "name", e.target.value)} className="bg-transparent border-none outline-none text-[0.85rem] text-foreground py-1.5 placeholder:text-muted-foreground min-w-0" />
              <input type="text" placeholder="ej. 200 g" value={ing.quantity} onChange={(e) => updateIngredient(ing.id, "quantity", e.target.value)} className="bg-transparent border-none outline-none text-[0.85rem] text-foreground py-1.5 placeholder:text-muted-foreground min-w-0" />
              <button type="button" onClick={() => removeIngredient(ing.id)} className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button type="button" onClick={addIngredient} className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-2 rounded-lg border border-dashed border-border text-muted-foreground text-[0.8rem] font-semibold hover:bg-secondary hover:text-primary hover:border-ring transition-colors w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Añadir ingrediente
        </button>
      </div>
    </AdminFormLayout>
  );
}