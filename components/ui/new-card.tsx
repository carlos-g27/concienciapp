"use client";

import styles from "./new-card.module.css";

// --- Props ---
interface CardProps {
  onClick: () => void;
  isSelected?: boolean;
  children: React.ReactNode;
}

// --- Componente genérico reutilizable ---
export default function Card({ onClick, isSelected = false, children }: CardProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.card} ${isSelected ? styles.cardActive : ""}`}
    >
      {/* Contenido libre — lo define quien usa el card */}
      <div className={styles.cardContent}>
        {children}
      </div>

      {/* Flecha derecha fija */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.cardArrow}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}