"use client";

import styles from "./meal-detail.module.css";

// --- Tipos exportados para uso en nutricion.tsx ---
export interface Ingredient {
  name: string;
  quantity: number;
  unit: "g" | "ml" | "oz" | "taza" | "pieza" | "cdta" | "cda";
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
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
    <div className={`${styles.wrapper} ${isOpen ? styles.wrapperOpen : ""}`}>

      {/* Header — siempre visible, actúa como trigger del acordeón */}
      <button className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
        <span className={styles.recipeName}>{recipe.name}</span>
        <div className={styles.headerRight}>
          <span className={styles.calories}>{recipe.calories} kcal</span>
          <svg
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Contenido expandible */}
      {isOpen && (
        <div className={styles.body}>

          {/* Imagen placeholder de la receta */}
          <div className={styles.imagePlaceholder}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={styles.imagePlaceholderIcon}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className={styles.imagePlaceholderLabel}>Imagen de la receta</span>
          </div>

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
                  <span className={styles.ingredientQty}>
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}