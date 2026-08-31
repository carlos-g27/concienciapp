"use client";

import { useState } from "react";
import SidebarLayout from "@/components/user-component/dashboard-logic/sidebar-config";
import CategoryCard from "@/components/ui/category-card";
import PilarMaintenance from "@/components/ui/pilar-maintenance";
import { usePilarSettings } from "@/hooks/use-pilar-settings";
import MealDetail from "./meal-detail";
import type { MealsByType, MealTypeKey, Recipe } from "../types";
import styles from "./nutricion.module.css";

interface MealCategory {
  id: MealTypeKey;
  title: string;
  icon: React.ReactNode;
  recipes: Recipe[];
}

// --- Íconos y títulos fijos por tipo de comida (Supabase no guarda íconos) ---
const MEAL_TYPE_META: { id: MealTypeKey; title: string; icon: React.ReactNode }[] = [
  {
    id: "breakfast",
    title: "Desayuno",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    id: "lunch",
    title: "Almuerzo",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
  },
  {
    id: "dinner",
    title: "Cena",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
  },
];

interface NutricionViewProps {
  initialMeals: MealsByType;
}

export default function NutricionView({ initialMeals }: NutricionViewProps) {
  const categories: MealCategory[] = MEAL_TYPE_META.map((meta) => ({
    ...meta,
    recipes: initialMeals[meta.id] ?? [],
  }));

  const [selectedCategory, setSelectedCategory] = useState<MealCategory | null>(null);
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);

  const handleSelectCategory = (meal: MealCategory) => {
    setSelectedCategory(meal);
    setOpenRecipeId(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setOpenRecipeId(null);
  };

  const handleToggleRecipe = (id: string) => {
    setOpenRecipeId((prev) => (prev === id ? null : id));
  };

  const { pilares, isLoading: pilaresLoading } = usePilarSettings();

  // Si el pilar está desactivado por el admin, mostrar pantalla de mantenimiento
  if (!pilaresLoading && !pilares.nutricion) {
    return (
      <SidebarLayout pageTitle="Nutrición">
        <PilarMaintenance pilarName="Pilar Nutrición" />
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout pageTitle="Nutrición">
      <div className={styles.page}>

        {selectedCategory ? (
          /* ── Vista: lista de recetas de la categoría seleccionada ── */
          <div className={styles.recipeView}>

            {/* Botón volver */}
            <button onClick={handleBack} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver a comidas
            </button>

            {/* Header de la categoría */}
            <div className={styles.categoryHeader}>
              <h1 className={styles.categoryTitle}>{selectedCategory.title}</h1>
              <p className={styles.categorySubtitle}>
                {selectedCategory.recipes.length} receta{selectedCategory.recipes.length !== 1 ? "s" : ""} disponible{selectedCategory.recipes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Lista de recetas con acordeón */}
            {selectedCategory.recipes.length === 0 ? (
              <p className={styles.emptyMeal}>Aún no tienes recetas asignadas para esta comida.</p>
            ) : (
              <div className={styles.recipeList}>
                {selectedCategory.recipes.map((recipe) => (
                  <MealDetail
                    key={recipe.id}
                    recipe={recipe}
                    isOpen={openRecipeId === recipe.id}
                    onToggle={() => handleToggleRecipe(recipe.id)}
                  />
                ))}
              </div>
            )}

          </div>

        ) : (

          /* ── Vista: 3 categorías de comida ── */
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Mi Nutrición</h1>
              <p className={styles.pageSubtitle}>Selecciona una comida para ver tus recetas</p>
            </div>

            <div className={styles.mealsGrid}>
              {categories.map((meal) => (
                <CategoryCard
                  key={meal.id}
                  title={meal.title}
                  icon={meal.icon}
                  footerPrimaryText={`${meal.recipes.length} receta${meal.recipes.length !== 1 ? "s" : ""}`}
                  footerSecondaryText={`~${meal.recipes.reduce((sum, r) => sum + r.calories, 0)} kcal totales`}
                  onClick={() => handleSelectCategory(meal)}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </SidebarLayout>
  );
}
