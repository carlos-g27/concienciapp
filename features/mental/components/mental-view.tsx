"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CategoryCard from "@/components/ui/category-card";
import PilarMaintenance from "@/components/ui/pilar-maintenance";
import MeditationDetail from "./meditation-detail";
import type { Meditation, MeditationCategoryKey, MeditationsByCategory } from "../types";
import styles from "./mental.module.css";

// Icono del aviso "tu coach aún no te asignó…".
const NO_PLAN_ICON = (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <line x1="9" y1="16" x2="13" y2="16" />
  </svg>
);

interface MeditationCategory {
  id: MeditationCategoryKey;
  title: string;
  icon: React.ReactNode;
  meditations: Meditation[];
}

// --- Íconos por categoría (Supabase no guarda íconos) ---
const CATEGORY_META: { id: MeditationCategoryKey; icon: React.ReactNode }[] = [
  {
    id: "gratitud",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: "ansiedad",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: "dormir",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
  },
];

interface MentalViewProps {
  initialMeditations: MeditationsByCategory;
}

// --- Componente principal ---
export default function MentalView({ initialMeditations }: MentalViewProps) {
  const t = useTranslations("mental");

  const categories: MeditationCategory[] = CATEGORY_META.map((meta) => ({
    id: meta.id,
    title: t(meta.id),
    icon: meta.icon,
    meditations: initialMeditations[meta.id] ?? [],
  }));

  const [selectedCategory, setSelectedCategory] = useState<MeditationCategory | null>(null);
  const [openMeditationId, setOpenMeditationId] = useState<string | null>(null);

  const handleSelectCategory = (category: MeditationCategory) => {
    setSelectedCategory(category);
    setOpenMeditationId(null);
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setOpenMeditationId(null);
  };

  const handleToggleMeditation = (id: string) => {
    setOpenMeditationId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.page}>

        {selectedCategory ? (

          /* ── Vista: lista de meditaciones de la categoría ── */
          <div className={styles.meditationView}>

            {/* Botón volver */}
            <button onClick={handleBack} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t("backToCategories")}
            </button>

            {/* Header de la categoría */}
            <div className={styles.categoryHeader}>
              <h1 className={styles.categoryTitle}>{selectedCategory.title}</h1>
              <p className={styles.categorySubtitle}>
                {t("meditationsAvailable", { count: selectedCategory.meditations.length })}
              </p>
            </div>

            {/* Lista de meditaciones con acordeón */}
            {selectedCategory.meditations.length === 0 ? (
              <p className={styles.emptyCategory}>{t("emptyCategory")}</p>
            ) : (
              <div className={styles.meditationList}>
                {selectedCategory.meditations.map((meditation) => (
                  <MeditationDetail
                    key={meditation.id}
                    meditation={meditation}
                    isOpen={openMeditationId === meditation.id}
                    onToggle={() => handleToggleMeditation(meditation.id)}
                  />
                ))}
              </div>
            )}

          </div>

        ) : (

          /* ── Vista: 3 categorías ── */
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{t("title")}</h1>
              <p className={styles.pageSubtitle}>{t("subtitle")}</p>
            </div>

            {/* Sin meditaciones asignadas: un aviso en vez de categorías con "0" */}
            {categories.every((c) => c.meditations.length === 0) ? (
              <PilarMaintenance title={t("noPlanTitle")} description={t("noPlanDesc")} icon={NO_PLAN_ICON} backLink={false} />
            ) : (
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  icon={category.icon}
                  footerPrimaryText={t("meditationsCount", { count: category.meditations.length })}
                  footerSecondaryText={t("minTotal", {
                    min: category.meditations.reduce((sum, m) => sum + (m.duration ?? 0), 0),
                  })}
                  onClick={() => handleSelectCategory(category)}
                />
              ))}
            </div>
            )}
          </>
        )}

    </div>
  );
}
