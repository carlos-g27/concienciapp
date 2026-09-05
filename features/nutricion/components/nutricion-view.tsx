"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CategoryCard from "@/components/ui/category-card";
import MealDetail from "./meal-detail";
import type { MealsByType, MealTypeKey, Recipe } from "../types";
import styles from "./nutricion.module.css";

interface MealCategory {
  id: MealTypeKey;
  title: string;
  icon: React.ReactNode;
  recipes: Recipe[];
}

// --- Íconos y clave de título por tipo de comida (Supabase no guarda íconos) ---
const MEAL_TYPE_META: { id: MealTypeKey; titleKey: string; icon: React.ReactNode }[] = [
  {
    id: "breakfast",
    titleKey: "breakfast",
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
    titleKey: "lunch",
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
    titleKey: "dinner",
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
  const t = useTranslations("nutricion");

  const categories: MealCategory[] = MEAL_TYPE_META.map((meta) => ({
    id: meta.id,
    title: t(meta.titleKey),
    icon: meta.icon,
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

  return (
    <div className={styles.page}>

        {selectedCategory ? (
          /* ── Vista: lista de recetas de la categoría seleccionada ── */
          <div className={styles.recipeView}>

            {/* Botón volver */}
            <button onClick={handleBack} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t("backToMeals")}
            </button>

            {/* Header de la categoría */}
            <div className={styles.categoryHeader}>
              <h1 className={styles.categoryTitle}>{selectedCategory.title}</h1>
              <p className={styles.categorySubtitle}>
                {t("recipesAvailable", { count: selectedCategory.recipes.length })}
              </p>
            </div>

            {/* Lista de recetas con acordeón */}
            {selectedCategory.recipes.length === 0 ? (
              <p className={styles.emptyMeal}>{t("emptyMeal")}</p>
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
              <h1 className={styles.pageTitle}>{t("title")}</h1>
              <p className={styles.pageSubtitle}>{t("subtitle")}</p>
            </div>

            <div className={styles.mealsGrid}>
              {categories.map((meal) => (
                <CategoryCard
                  key={meal.id}
                  title={meal.title}
                  icon={meal.icon}
                  footerPrimaryText={t("recipesCount", { count: meal.recipes.length })}
                  footerSecondaryText={t("kcalTotal", { kcal: meal.recipes.reduce((sum, r) => sum + r.calories, 0) })}
                  onClick={() => handleSelectCategory(meal)}
                />
              ))}
            </div>
          </>
        )}

    </div>
  );
}
