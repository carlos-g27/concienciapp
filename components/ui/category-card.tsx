import React from "react";
import styles from "./category-card.module.css";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  footerPrimaryText: string | React.ReactNode;
  footerSecondaryText: string | React.ReactNode;
  onClick?: () => void;
}

export default function CategoryCard({
  title,
  icon,
  footerPrimaryText,
  footerSecondaryText,
  onClick,
}: CategoryCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardImage}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardOverlay} />
        <span className={styles.cardTitle}>{title}</span>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.footerPrimary}>{footerPrimaryText}</span>
        <span className={styles.footerSecondary}>{footerSecondaryText}</span>
      </div>
    </div>
  );
}