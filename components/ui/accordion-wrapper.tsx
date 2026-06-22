import React from "react";
import styles from "./accordion-wrapper.module.css";

interface AccordionWrapperProps {
  title: string;
  badgeText: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function AccordionWrapper({
  title,
  badgeText,
  isOpen,
  onToggle,
  children,
}: AccordionWrapperProps) {
  return (
    <div className={`${styles.wrapper} ${isOpen ? styles.wrapperOpen : ""}`}>
      
      {/* Header — trigger del acordeón */}
      <button className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
        <span className={styles.title}>{title}</span>
        <div className={styles.headerRight}>
          <span className={styles.badge}>{badgeText}</span>
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
          {children}
        </div>
      )}

    </div>
  );
}