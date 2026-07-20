"use client";

import AccordionWrapper from "@/components/ui/accordion-wrapper";
import styles from "./meal-detail.module.css";

// --- Tipos exportados para uso en nutricion.tsx ---
export interface Ingredient {
  name: string;
  quantity: string; // texto libre, ej: "200 g", "1 unidad"
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  image_url?: string | null;
  ingredients: Ingredient[];
}

interface MealDetailProps {
  recipe: Recipe;
  isOpen: boolean;
  onToggle: () => void;
}

// --- Componente ---
export default function MealDetail({ recipe, isOpen, onToggle }: MealDetailProps) {
  return (
    <AccordionWrapper
      title={recipe.name}
      badgeText={`${recipe.calories} kcal`}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Imagen real de la receta si existe, si no, placeholder */}
      {recipe.image_url ? (
        <div className={styles.recipeImageWrapper}>
          <img src={recipe.image_url} alt={recipe.name} className={styles.recipeImage} />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={styles.imagePlaceholderIcon}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className={styles.imagePlaceholderLabel}>Imagen de la receta</span>
        </div>
      )}

      {/* Calorías totales */}
      <div className={styles.caloriesRow}>
        <span className={styles.caloriesLabel}>Calorías totales</span>
        <span className={styles.caloriesValue}>{recipe.calories} kcal</span>
      </div>

      {/* Lista de ingredientes */}
      <div className={styles.ingredientsSection}>
        <span className={styles.ingredientsTitle}>Ingredientes</span>
        <div className={styles.ingredientsList}>
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className={styles.ingredientRow}>
              <span className={styles.ingredientName}>{ing.name}</span>
              <span className={styles.ingredientQty}>{ing.quantity}</span>
            </div>
          ))}
        </div>
      </div>
    </AccordionWrapper>
  );
}