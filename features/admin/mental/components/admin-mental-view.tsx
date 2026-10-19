"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import TabbedCard, { TabItem } from "@/components/ui/tabbed-card";
import {
  MEDITATION_CATEGORIES,
  MEDITATION_CATEGORY_LABEL_KEYS,
  type MeditationCategory,
} from "@/features/admin/meditations/types";
import MobileSaveBar from "@/components/ui/mobile-save-bar";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes";
import MeditationPickerModal from "./meditation-picker-modal";
import { saveUserMeditations } from "../actions";
import type { CatalogMeditation, MeditationsByCategory } from "../types";
// Misma apariencia que el plan de comidas: se reutiliza su hoja de estilos.
import styles from "@/features/admin/nutricion/components/admin-nutricion.module.css";

interface AdminMentalViewProps {
  userId: string;
  initialMeditations: MeditationsByCategory;
  catalog: CatalogMeditation[];
}

export default function AdminMentalView({ userId, initialMeditations, catalog }: AdminMentalViewProps) {
  const t = useTranslations("adminAssign");
  const tc = useTranslations("adminCatalog");
  const [activeCategory, setActiveCategory] = useState<MeditationCategory>("ansiedad");
  const [meditations, setMeditations] = useState<MeditationsByCategory>(initialMeditations);
  const [isSaving, setIsSaving] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cambios sin guardar: asignaciones actuales vs. últimas guardadas.
  const currentValues = JSON.stringify(meditations);
  const [savedValues, setSavedValues] = useState(currentValues);
  const isDirty = currentValues !== savedValues;
  useUnsavedChangesWarning(isDirty);

  const handleSelectMeditation = (meditation: CatalogMeditation) => {
    setMeditations((prev) => ({
      ...prev,
      [activeCategory]: [
        ...prev[activeCategory],
        { meditationId: meditation.id, name: meditation.name, duration: meditation.duration },
      ],
    }));
    setIsPickerOpen(false);
  };

  const handleRemove = (meditationId: string) => {
    setMeditations((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter((m) => m.meditationId !== meditationId),
    }));
  };

  const handleSaveMeditations = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMsg(null);

    const meditationIds = Object.values(meditations).flat().map((m) => m.meditationId);

    const res = await saveUserMeditations(userId, { meditationIds });

    if (res.success) {
      setSavedValues(currentValues);
      setSuccessMsg(t("savedMeditations"));
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError(res.error ?? t("errSave"));
    }

    setIsSaving(false);
  };

  const totalAssigned = Object.values(meditations).reduce((sum, list) => sum + list.length, 0);
  const activeMeditations = meditations[activeCategory];

  const tabItems: TabItem[] = MEDITATION_CATEGORIES.map((key) => ({
    key,
    label: tc(MEDITATION_CATEGORY_LABEL_KEYS[key]),
    badge: meditations[key].length,
  }));

  return (
    <div className={styles.page}>

      <Link href={`/admin/users/${userId}`} className={styles.backBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToProfile")}
      </Link>

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t("mentalTitle")}</h1>
          <p className={styles.pageSubtitle}>
            {t("assignedTotalMeditations", { count: totalAssigned })}
          </p>
        </div>
        {/* En móvil el botón va en la barra inferior (MobileSaveBar) */}
        <Button onClick={handleSaveMeditations} disabled={isSaving || !isDirty} className="hidden lg:inline-flex">
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>

      {successMsg && <div className={`${styles.successBanner} hidden lg:block`}>{successMsg}</div>}
      {error && <div className={`${styles.errorBanner} hidden lg:block`}>{error}</div>}

      <TabbedCard
        tabs={tabItems}
        activeTab={activeCategory}
        onTabChange={(key) => setActiveCategory(key as MeditationCategory)}
      >
        {/* Lista de meditaciones asignadas a la categoría activa */}
        <div className={styles.assignedList}>
          {activeMeditations.length === 0 ? (
            <p className={styles.emptyMeal}>{t("emptyCategory")}</p>
          ) : (
            activeMeditations.map((meditation) => (
              <div key={meditation.meditationId} className={styles.recipeRow}>

                <div className={styles.recipeThumb}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                  </svg>
                </div>

                <div className={styles.recipeInfo}>
                  <span className={styles.recipeName}>{meditation.name}</span>
                  {meditation.duration != null && (
                    <span className={styles.recipeCalories}>
                      {tc("medMinutes", { n: meditation.duration })}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(meditation.meditationId)}
                  className={styles.deleteBtn}
                  aria-label={t("removeMeditation")}
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

        {/* Botón agregar meditación */}
        <button onClick={() => setIsPickerOpen(true)} className={styles.addRecipeBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {t("addMeditation")}
        </button>
      </TabbedCard>

      <MobileSaveBar
        onSave={handleSaveMeditations}
        disabled={isSaving || !isDirty}
        isSaving={isSaving}
        label={t("save")}
        savingLabel={t("saving")}
        successMsg={successMsg}
        error={error}
      />

      {/* Modal picker */}
      {isPickerOpen && (
        <MeditationPickerModal
          catalog={catalog}
          category={activeCategory}
          excludeIds={activeMeditations.map((m) => m.meditationId)}
          onSelect={handleSelectMeditation}
          onClose={() => setIsPickerOpen(false)}
        />
      )}

    </div>
  );
}
