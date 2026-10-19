"use client";

import { useTranslations } from "next-intl";
import AccordionWrapper from "@/components/ui/accordion-wrapper";
import { getVideoEmbedInfo } from "@/lib/video";
import type { Meditation } from "../types";
import styles from "./meditation-detail.module.css";

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
  const t = useTranslations("mental");
  const durationText =
    meditation.duration != null ? t("minutes", { n: meditation.duration }) : "";
  const videoInfo = meditation.video_url ? getVideoEmbedInfo(meditation.video_url) : null;

  return (
    <AccordionWrapper
      title={meditation.name}
      badgeText={durationText}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {/* Video (solo se monta con el acordeón abierto: al cerrarlo se detiene) */}
      {videoInfo ? (
        <div className={styles.videoWrapper}>
          {videoInfo.type === "file" ? (
            <video controls className={styles.videoElement} src={videoInfo.src} />
          ) : (
            <iframe
              className={styles.videoElement}
              src={videoInfo.src}
              title={meditation.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <div className={styles.videoPlaceholder}>{t("noVideo")}</div>
      )}

      {/* Duración */}
      {meditation.duration != null && (
        <div className={styles.durationRow}>
          <span className={styles.durationLabel}>{t("duration")}</span>
          <span className={styles.durationValue}>{durationText}</span>
        </div>
      )}
    </AccordionWrapper>
  );
}
