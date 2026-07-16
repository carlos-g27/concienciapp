"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import styles from "./recipe-picker-modal.module.css";

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
  excludeIds: string[]; // recetas ya asignadas al usuario en esta comida
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

  useEffect(() => {
    fetchRecipes();
  }, [mealType]);

  const filtered = recipes
    .filter((r) => !excludeIds.includes(r.id))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (recipeId: string) => {
    router.push(`/admin/recipes?id=${recipeId}`);
  };

  const handleDelete = async (recipe: CatalogRecipe) => {
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Agregar receta</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Buscador */}
        <div className={styles.searchWrapper}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <Input
            type="text"
            placeholder="Buscar receta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Lista */}
        <div className={styles.list}>
          {isLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)
          ) : filtered.length === 0 ? (
            <p className={styles.emptyState}>
              {recipes.length === 0
                ? "Aún no hay recetas para esta comida."
                : "No se encontraron recetas."}
            </p>
          ) : (
            filtered.map((recipe) => (
              <div key={recipe.id} className={styles.recipeItem}>

                {/* Zona clickeable: selecciona la receta */}
                <button
                  onClick={() => onSelect(recipe)}
                  className={styles.recipeItemMain}
                >
                  <div className={styles.recipeItemThumb}>
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.name} className={styles.recipeItemImg} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.recipeItemInfo}>
                    <span className={styles.recipeItemName}>{recipe.name}</span>
                    <span className={styles.recipeItemCalories}>{recipe.calories} kcal</span>
                  </div>
                </button>

                {/* Acciones: editar / eliminar */}
                <div className={styles.recipeItemActions}>
                  <button
                    onClick={() => handleEdit(recipe.id)}
                    className={styles.actionBtn}
                    aria-label={`Editar ${recipe.name}`}
                    title="Editar receta"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(recipe)}
                    disabled={deletingId === recipe.id}
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    aria-label={`Eliminar ${recipe.name}`}
                    title="Eliminar receta"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.addIcon}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>

              </div>
            ))
          )}
        </div>

        {/* Link para crear receta nueva — preselecciona el tipo de comida activo */}
        <div className={styles.modalFooter}>
          <p className={styles.footerText}>¿No encuentras la receta?</p>
          <Link href={`/admin/recipes?type=${mealType}`} className={styles.createLink}>
            + Crear nueva receta
          </Link>
        </div>

      </div>
    </div>
  );
}