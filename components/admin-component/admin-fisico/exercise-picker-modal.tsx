"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import styles from "./exercise-picker-modal.module.css";

// --- Tipos ---
export interface CatalogExercise {
  id: string;
  name: string;
  muscle: string;
}

interface ExercisePickerModalProps {
  excludeIds: string[]; // ejercicios ya asignados al día activo, se ocultan del picker
  onSelect: (exercise: CatalogExercise) => void;
  onClose: () => void;
}

export default function ExercisePickerModal({
  excludeIds,
  onSelect,
  onClose,
}: ExercisePickerModalProps) {
  const supabase = createClient();
  const [exercises, setExercises] = useState<CatalogExercise[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("id, name, muscle")
          .order("name", { ascending: true });

        if (error) throw error;
        setExercises(data ?? []);
      } catch (err) {
        console.error("Error cargando catálogo:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filtered = exercises
    .filter((e) => !excludeIds.includes(e.id))
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Agregar ejercicio</h2>
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
            placeholder="Buscar ejercicio..."
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
              {exercises.length === 0
                ? "Aún no hay ejercicios en el catálogo."
                : "No se encontraron ejercicios."}
            </p>
          ) : (
            filtered.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className={styles.exerciseItem}
              >
                <div className={styles.exerciseItemThumb}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="2" />
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
                    <path d="M7 21v-4" />
                    <path d="M17 21v-4" />
                  </svg>
                </div>
                <div className={styles.exerciseItemInfo}>
                  <span className={styles.exerciseItemName}>{exercise.name}</span>
                  <span className={styles.exerciseItemMuscle}>{exercise.muscle}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.addIcon}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            ))
          )}
        </div>

        {/* Link para crear ejercicio nuevo */}
        <div className={styles.modalFooter}>
          <p className={styles.footerText}>¿No encuentras el ejercicio?</p>
          <Link href="/admin/exercises" className={styles.createLink}>
            + Crear nuevo ejercicio
          </Link>
        </div>

      </div>
    </div>
  );
}