"use client";

import { useState } from "react";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import CategoryCard from "@/components/ui/category-card";
import MealDetail, { Recipe } from "./meal-detail";
import styles from "./nutricion.module.css";

// --- Tipos ---
interface MealCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  recipes: Recipe[];
}

// --- Datos mock ---
const MEAL_CATEGORIES: MealCategory[] = [
  {
    id: "desayuno",
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
    recipes: [
      {
        id: "des-1",
        name: "Avena con frutas",
        calories: 380,
        ingredients: [
          { name: "Avena en hojuelas", quantity: 80,  unit: "g"    },
          { name: "Leche descremada",  quantity: 200, unit: "ml"   },
          { name: "Plátano",           quantity: 1,   unit: "pieza"},
          { name: "Fresas",            quantity: 50,  unit: "g"    },
          { name: "Miel de abeja",     quantity: 1,   unit: "cda"  },
        ],
      },
      {
        id: "des-2",
        name: "Huevos revueltos con tostadas",
        calories: 420,
        ingredients: [
          { name: "Huevos",            quantity: 3,   unit: "pieza"},
          { name: "Pan integral",      quantity: 2,   unit: "pieza"},
          { name: "Aceite de oliva",   quantity: 1,   unit: "cdta" },
          { name: "Tomate cherry",     quantity: 80,  unit: "g"    },
          { name: "Espinaca baby",     quantity: 30,  unit: "g"    },
        ],
      },
      {
        id: "des-3",
        name: "Smoothie proteico",
        calories: 310,
        ingredients: [
          { name: "Proteína en polvo", quantity: 30,  unit: "g"    },
          { name: "Leche de almendra", quantity: 250, unit: "ml"   },
          { name: "Plátano congelado", quantity: 1,   unit: "pieza"},
          { name: "Mantequilla maní",  quantity: 15,  unit: "g"    },
          { name: "Hielo",             quantity: 1,   unit: "taza" },
        ],
      },
    ],
  },
  {
    id: "almuerzo",
    title: "Almuerzo",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
      </svg>
    ),
    recipes: [
      {
        id: "alm-1",
        name: "Pechuga de pollo con arroz",
        calories: 620,
        ingredients: [
          { name: "Pechuga de pollo",  quantity: 200, unit: "g"    },
          { name: "Arroz blanco",      quantity: 150, unit: "g"    },
          { name: "Brócoli",           quantity: 100, unit: "g"    },
          { name: "Aceite de oliva",   quantity: 1,   unit: "cda"  },
          { name: "Ajo",               quantity: 2,   unit: "pieza"},
          { name: "Limón",             quantity: 1,   unit: "pieza"},
        ],
      },
      {
        id: "alm-2",
        name: "Ensalada de atún",
        calories: 450,
        ingredients: [
          { name: "Atún en agua",      quantity: 150, unit: "g"    },
          { name: "Lechuga romana",    quantity: 100, unit: "g"    },
          { name: "Tomate",            quantity: 80,  unit: "g"    },
          { name: "Pepino",            quantity: 60,  unit: "g"    },
          { name: "Aceite de oliva",   quantity: 1,   unit: "cda"  },
          { name: "Vinagre balsámico", quantity: 1,   unit: "cdta" },
        ],
      },
      {
        id: "alm-3",
        name: "Pasta con salsa de tomate",
        calories: 580,
        ingredients: [
          { name: "Pasta integral",    quantity: 120, unit: "g"    },
          { name: "Tomate triturado",  quantity: 200, unit: "g"    },
          { name: "Carne molida",      quantity: 100, unit: "g"    },
          { name: "Cebolla",           quantity: 50,  unit: "g"    },
          { name: "Albahaca",          quantity: 5,   unit: "g"    },
        ],
      },
    ],
  },
  {
    id: "cena",
    title: "Cena",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
    recipes: [
      {
        id: "cen-1",
        name: "Salmón al horno",
        calories: 520,
        ingredients: [
          { name: "Filete de salmón",  quantity: 180, unit: "g"    },
          { name: "Espárragos",        quantity: 120, unit: "g"    },
          { name: "Aceite de oliva",   quantity: 1,   unit: "cda"  },
          { name: "Ajo en polvo",      quantity: 1,   unit: "cdta" },
          { name: "Limón",             quantity: 1,   unit: "pieza"},
        ],
      },
      {
        id: "cen-2",
        name: "Sopa de verduras",
        calories: 280,
        ingredients: [
          { name: "Zanahoria",         quantity: 80,  unit: "g"    },
          { name: "Calabaza",          quantity: 100, unit: "g"    },
          { name: "Papa",              quantity: 80,  unit: "g"    },
          { name: "Caldo de pollo",    quantity: 400, unit: "ml"   },
          { name: "Cebolla",           quantity: 50,  unit: "g"    },
          { name: "Sal y pimienta",    quantity: 1,   unit: "cdta" },
        ],
      },
      {
        id: "cen-3",
        name: "Wrap de pollo y aguacate",
        calories: 490,
        ingredients: [
          { name: "Tortilla integral", quantity: 1,   unit: "pieza"},
          { name: "Pollo cocido",      quantity: 120, unit: "g"    },
          { name: "Aguacate",          quantity: 80,  unit: "g"    },
          { name: "Lechuga",           quantity: 40,  unit: "g"    },
          { name: "Tomate",            quantity: 50,  unit: "g"    },
        ],
      },
    ],
  },
];

// --- Componente principal ---
export default function Nutricion() {
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
                {selectedCategory.recipes.length} recetas disponibles
              </p>
            </div>

            {/* Lista de recetas con acordeón */}
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

          </div>

        ) : (

          /* ── Vista: 3 categorías de comida ── */
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Mi Nutrición</h1>
              <p className={styles.pageSubtitle}>Selecciona una comida para ver tus recetas</p>
            </div>

            <div className={styles.mealsGrid}>
              {MEAL_CATEGORIES.map((meal) => (
                <CategoryCard
                  key={meal.id}
                  title={meal.title}
                  icon={meal.icon}
                  footerPrimaryText={`${meal.recipes.length} recetas`}
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