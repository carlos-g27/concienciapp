"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PickerModal, { PickerItem } from "@/components/ui/picker-modal";

// --- Tipos ---
export type MealType = "breakfast" | "lunch" | "dinner";

export interface CatalogRecipe {
  id: string;
  name: string;
  calories: number;
  image_url: string | null;
}

interface RecipePickerModalProps {
  mealType: MealType;
  excludeIds: string[];
  onSelect: (recipe: CatalogRecipe) => void;
  onClose: () => void;
}

export default function RecipePickerModal({
  mealType,
  excludeIds,
  onSelect,
  onClose,
}: RecipePickerModalProps) {
  const supabase = createClient();
  const router = useRouter();
  const [recipes, setRecipes] = useState<CatalogRecipe[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const { data, error } = await supabase
          .from("recipes")
          .select("id, name, calories, image_url")
          .eq("meal_type", mealType)
          .order("name", { ascending: true });

        if (error) throw error;
        setRecipes(data ?? []);
      } catch (err) {
        console.error("Error cargando recetas:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [mealType]);

  const filtered = recipes
    .filter((r) => !excludeIds.includes(r.id))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  // Mapeamos las recetas al formato genérico de PickerItem
  const pickerItems: (PickerItem & { original: CatalogRecipe })[] = filtered.map((recipe) => ({
    id: recipe.id,
    title: recipe.name,
    subtitle: `${recipe.calories} kcal`,
    imageUrl: recipe.image_url,
    original: recipe,
  }));

  const handleEdit = (recipeId: string) => {
    router.push(`/admin/recipes?id=${recipeId}`);
  };

  const handleDelete = async (item: PickerItem & { original: CatalogRecipe }) => {
    const recipe = item.original;
    const confirmed = window.confirm(
      `¿Eliminar "${recipe.name}"? Esto también la quitará del plan de todos los usuarios que la tengan asignada.`
    );
    if (!confirmed) return;

    setDeletingId(recipe.id);
    try {
      const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
      if (error) throw error;
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id));
    } catch (err) {
      console.error("Error eliminando receta:", err);
      alert("No se pudo eliminar la receta. Intenta de nuevo.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PickerModal
      title="Agregar receta"
      searchPlaceholder="Buscar receta..."
      search={search}
      onSearchChange={setSearch}
      items={pickerItems}
      isLoading={isLoading}
      emptyMessage={
        recipes.length === 0
          ? "Aún no hay recetas para esta comida."
          : "No se encontraron recetas."
      }
      deletingId={deletingId}
      onSelect={(item) => onSelect(item.original)}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={onClose}
      footerPrompt="¿No encuentras la receta?"
      createLinkHref={`/admin/recipes?type=${mealType}`}
      createLinkLabel="+ Crear nueva receta"
    />
  );
}