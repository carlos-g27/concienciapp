"use client";

import styles from "./exercise-card.module.css";

// --- Tipo compartido del ejercicio ---
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: number;
  reps: number;
  description: string;
  instructions: string[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected?: boolean;
  onClick: () => void;
}

// --- Componente reutilizable: tarjeta de ejercicio ---
export default function ExerciseCard({
  exercise,
  isSelected = false,
  onClick,
}: ExerciseCardProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.exerciseCard} ${isSelected ? styles.exerciseCardActive : ""}`}
    >
      {/* Imagen mock del ejercicio */}
      <div className={styles.exerciseThumb}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.exerciseThumbIcon}>
          <circle cx="12" cy="8" r="2" />
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
          <path d="M7 21v-4" />
          <path d="M17 21v-4" />
        </svg>
      </div>

      {/* Info */}
      <div className={styles.exerciseInfo}>
        <span className={styles.exerciseName}>{exercise.name}</span>
        <span className={styles.exerciseMeta}>
          {exercise.muscle}
        </span>
        <div className={styles.exerciseBadges}>
          <span className={styles.badge}>{exercise.sets} series</span>
          <span className={styles.badge}>{exercise.reps} reps</span>
        </div>
      </div>

      {/* Flecha */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.exerciseArrow}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}