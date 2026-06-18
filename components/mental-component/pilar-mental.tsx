"use client";

import { useState } from "react";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import Card from "@/components/ui/new-card";
import MeditationDetail, { Meditation } from "./meditation-detail";
import styles from "./mental.module.css";

// --- Tipos ---
interface MeditationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  meditations: Meditation[];
}

// --- Datos mock ---
const MEDITATION_CATEGORIES: MeditationCategory[] = [
  {
    id: "gratitud",
    title: "Gratitud",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    meditations: [
      { id: "gra-1", name: "Gratitud por el presente",     duration: "5 min"  },
      { id: "gra-2", name: "Agradecimiento profundo",      duration: "10 min" },
      { id: "gra-3", name: "Diario de gratitud guiado",    duration: "15 min" },
      { id: "gra-4", name: "Gratitud por el cuerpo",       duration: "8 min"  },
    ],
  },
  {
    id: "ansiedad",
    title: "Ansiedad",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    meditations: [
      { id: "ans-1", name: "Respiración 4-7-8",            duration: "7 min"  },
      { id: "ans-2", name: "Calmar la mente acelerada",    duration: "12 min" },
      { id: "ans-3", name: "Escaneo corporal anti-estrés", duration: "10 min" },
      { id: "ans-4", name: "Liberación de tensión",        duration: "15 min" },
    ],
  },
  {
    id: "sueno",
    title: "Sueño",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
    meditations: [
      { id: "sue-1", name: "Relajación para dormir",       duration: "20 min" },
      { id: "sue-2", name: "Body scan nocturno",           duration: "15 min" },
      { id: "sue-3", name: "Respiración para el sueño",    duration: "10 min" },
      { id: "sue-4", name: "Visualización de descanso",    duration: "18 min" },
    ],
  },
];

// --- Subcomponente: card de categoría ---
function CategoryCard({
  category,
  onClick,
}: {
  category: MeditationCategory;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick}>
      <div className={styles.categoryCardImage}>
        <div className={styles.categoryCardIcon}>{category.icon}</div>
        <div className={styles.categoryCardOverlay} />
        <span className={styles.categoryCardTitle}>{category.title}</span>
      </div>
      <div className={styles.categoryCardFooter}>
        <span className={styles.categoryCardCount}>
          {category.meditations.length} meditaciones
        </span>
        <span className={styles.categoryCardTotal}>
          ~{category.meditations.reduce((sum, m) => sum + parseInt(m.duration), 0)} min totales
        </span>
      </div>
    </Card>
  );
}

// --- Componente principal ---
export default function Mental() {
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
    <SidebarLayout pageTitle="Mental">
      <div className={styles.page}>

        {selectedCategory ? (

          /* ── Vista: lista de meditaciones de la categoría ── */
          <div className={styles.meditationView}>

            {/* Botón volver */}
            <button onClick={handleBack} className={styles.backBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver a categorías
            </button>

            {/* Header de la categoría */}
            <div className={styles.categoryHeader}>
              <h1 className={styles.categoryTitle}>{selectedCategory.title}</h1>
              <p className={styles.categorySubtitle}>
                {selectedCategory.meditations.length} meditaciones disponibles
              </p>
            </div>

            {/* Lista de meditaciones con acordeón */}
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

          </div>

        ) : (

          /* ── Vista: 3 categorías ── */
          <>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Mi Bienestar Mental</h1>
              <p className={styles.pageSubtitle}>Selecciona una categoría para ver tus meditaciones</p>
            </div>

            <div className={styles.categoriesGrid}>
              {MEDITATION_CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => handleSelectCategory(category)}
                />
              ))}
            </div>
          </>
        )}

      </div>
    </SidebarLayout>
  );
}