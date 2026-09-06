"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./brand-loader.module.css";

interface BrandLoaderProps {
  /** Tamaño del loader: "md" (pantalla completa) o "sm" (formularios). */
  size?: "sm" | "md";
  /** Etiqueta accesible (sr-only). Si se omite, usa common.loading. */
  label?: string;
  className?: string;
}

/**
 * Animación de carga de marca: el logo de la empresa con un latido sutil y,
 * debajo, una línea de signos vitales que barre como un monitor cardíaco.
 * Reemplaza el texto plano "Cargando...".
 */
export default function BrandLoader({
  size = "md",
  label,
  className,
}: BrandLoaderProps) {
  const t = useTranslations("common");
  const logoPx = size === "sm" ? 52 : 96;

  return (
    <div
      className={`${styles.wrap} ${size === "sm" ? styles.sm : ""} ${className ?? ""}`}
      role="status"
      aria-live="polite"
    >
      <Image
        src="/logo.svg"
        alt=""
        width={logoPx}
        height={logoPx}
        priority
        className={styles.logo}
      />

      {/* Monitor de signos vitales: 2 ciclos (400px) que se desplazan 200px */}
      <div className={styles.monitor} aria-hidden="true">
        <svg
          className={styles.svg}
          viewBox="0 0 400 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className={styles.trace}>
            <polyline
              className={styles.line}
              points="0,30 70,30 82,24 94,30 104,34 112,8 120,50 128,30 150,22 172,30 200,30 270,30 282,24 294,30 304,34 312,8 320,50 328,30 350,22 372,30 400,30"
            />
            {/* Punto guía brillante sobre cada pico R */}
            <circle className={styles.dot} cx="112" cy="8" r="4" />
            <circle className={styles.dot} cx="312" cy="8" r="4" />
          </g>
        </svg>
      </div>

      <span className="sr-only">{label ?? t("loading")}</span>
    </div>
  );
}
