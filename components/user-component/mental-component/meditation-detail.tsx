"use client";

import AccordionWrapper from "@/components/ui/accordion-wrapper";
import styles from "./meditation-detail.module.css";

// --- Tipos exportados ---
export interface Meditation {
  id: string;
  name: string;
  duration: string; // ej: "10 min"
}

interface MeditationDetailProps {
  meditation: Meditation;
  isOpen: boolean;
  onToggle: () => void;
}

// --- Componente ---
export default function MeditationDetail({
  meditation,
  isOpen,
  onToggle,
}: MeditationDetailProps) {
  return (
    <AccordionWrapper
      title={meditation.name}
      badgeText={meditation.duration}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Video placeholder */}
      <div className={styles.videoPlaceholder}>
        <div className={styles.playBtn}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        
        {/* Barra de progreso simulada */}
        <div className={styles.videoControls}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className={styles.playIcon}>
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
            <div className={styles.progressThumb} />
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </div>
      </div>

      {/* Duración */}
      <div className={styles.durationRow}>
        <span className={styles.durationLabel}>Duración</span>
        <span className={styles.durationValue}>{meditation.duration}</span>
      </div>
    </AccordionWrapper>
  );
}