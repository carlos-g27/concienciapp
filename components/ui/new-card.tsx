"use client";

import styles from "./new-card.module.css";

// --- Props ---
interface CardProps {
  onClick?: () => void;
  isSelected?: boolean;
  children: React.ReactNode;
}

// --- Componente genérico reutilizable ---
export default function Card({ onClick, isSelected = false, children }: CardProps) {
  // Usamos un `div` con `role="button"` para evitar botones anidados cuando
  // el contenido interno puede incluir elementos interactivos (por ejemplo,
  // otro `button`). También manejamos `onKeyDown` para accesibilidad.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`${styles.card} ${isSelected ? styles.cardActive : ""}`}
    >
      {/* Contenido libre — lo define quien usa el card */}
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}