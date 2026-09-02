"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TabbedCard, { TabItem } from "@/components/ui/tabbed-card";
import RecipePickerModal from "./recipe-picker-modal";
import { saveUserMeals } from "../actions";
import type { CatalogRecipe, MealsByType, MealType } from "../types";
import styles from "./admin-nutricion.module.css";

const MEAL_TABS: { key: MealType; label: string }[] = [
  { key: "breakfast", label: "Desayuno" },
  { key: "lunch",     label: "Almuerzo" },
  { key: "dinner",    label: "Cena" },
];

interface AdminNutricionViewProps {
  userId: string;
  initialMeals: MealsByType;
  catalog: CatalogRecipe[];
}

export default function AdminNutricionView({ userId, initialMeals, catalog }: AdminNutricionViewProps) {
  const [activeMeal, setActiveMeal] = useState<MealType>("breakfast");
  const [meals, setMeals] = useState<MealsByType>(initialMeals);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRecipe = (recipe: CatalogRecipe) => {
    setMeals((prev) => ({
      ...prev,
      [activeMeal]: [
        ...prev[activeMeal],
        { recipeId: recipe.id, name: recipe.name, calories: recipe.calories, image_url: recipe.image_url },
      ],
    }));
    setIsPickerOpen(false);
  };

  const handleRemove = (recipeId: string) => {
    setMeals((prev) => ({
      ...prev,
      [activeMeal]: prev[activeMeal].filter((r) => r.recipeId !== recipeId),
    }));
  };

  const handleSaveMeals = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const recipeIds = Object.values(meals).flat().map((r) => r.recipeId);

    const res = await saveUserMeals(userId, { recipeIds });

    if (res.success) {
      setSuccessMsg("Plan de comidas guardado correctamente.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? "Error al guardar.");
    }

    setIsSaving(false);
  };

  const totalAssigned = Object.values(meals).reduce((sum, list) => sum + list.length, 0);
  const activeRecipes = meals[activeMeal];

  const tabItems: TabItem[] = MEAL_TABS.map((tab) => ({
    key: tab.key,
    label: tab.label,
    badge: meals[tab.key].length,
  }));

  return (
    <div className={styles.page}>

      <Link href={`/admin/users/${userId}`} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al perfil
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Plan de comidas — Pilar Nutrición</h1>
          <p className={styles.pageSubtitle}>
            {totalAssigned} receta{totalAssigned !== 1 ? "s" : ""} asignada{totalAssigned !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Button onClick={handleSaveMeals} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      <TabbedCard
        tabs={tabItems}
        activeTab={activeMeal}
        onTabChange={(key) => setActiveMeal(key as MealType)}
      >
        {/* Lista de recetas asignadas a la comida activa */}
        <div className={styles.assignedList}>
          {activeRecipes.length === 0 ? (
            <p className={styles.emptyMeal}>Sin recetas asignadas para esta comida.</p>
          ) : (
            activeRecipes.map((recipe) => (
              <div key={recipe.recipeId} className={styles.recipeRow}>

                <div className={styles.recipeThumb}>
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.name} className={styles.recipeThumbImg} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </div>

                <div className={styles.recipeInfo}>
                  <span className={styles.recipeName}>{recipe.name}</span>
                  <span className={styles.recipeCalories}>{recipe.calories} kcal</span>
                </div>

                <button
                  onClick={() => handleRemove(recipe.recipeId)}
                  className={styles.deleteBtn}
                  aria-label="Quitar receta"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

              </div>
            ))
          )}
        </div>

        {/* Botón agregar receta */}
        <button onClick={() => setIsPickerOpen(true)} className={styles.addRecipeBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar receta
        </button>
      </TabbedCard>

      {/* Modal picker */}
      {isPickerOpen && (
        <RecipePickerModal
          catalog={catalog}
          mealType={activeMeal}
          excludeIds={activeRecipes.map((r) => r.recipeId)}
          onSelect={handleSelectRecipe}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

    </div>
  );
}
