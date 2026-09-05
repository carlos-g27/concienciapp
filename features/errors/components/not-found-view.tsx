import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./not-found-view.module.css";

/**
 * Vista de error 404 con identidad de marca (fondo azul marino fijo).
 * Se muestra automáticamente en cualquier ruta inexistente vía app/not-found.tsx.
 * Bilingüe (ES/EN) mediante el namespace "notFound" de next-intl.
 */
export default async function NotFoundView() {
  const t = await getTranslations("notFound");

  return (
    <div className={styles.page}>
      <span className={styles.glow} aria-hidden="true" />

      <div className={styles.content}>
        {/* Columna de texto */}
        <div className={styles.text}>
          <span className={styles.badge}>{t("badge")}</span>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.description}>{t("description")}</p>
          <div className={styles.actions}>
            <Link href="/" className={styles.backButton}>
              {t("backHome")}
            </Link>
          </div>
        </div>

        {/* Ilustración: ventana de navegador con pulso "sin ritmo" */}
        <svg
          className={styles.illustration}
          viewBox="0 0 460 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`${t("illustrationCode")} — ${t("illustrationLabel")}`}
        >
          {/* Triángulos de advertencia decorativos */}
          <g opacity="0.9">
            <path
              d="M40 18 L74 78 L6 78 Z"
              fill="var(--brand-700)"
              stroke="var(--brand-500)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <rect x="37" y="40" width="6" height="20" rx="3" fill="var(--brand-100)" />
            <circle cx="40" cy="68" r="3.5" fill="var(--brand-100)" />
          </g>
          <g opacity="0.75">
            <path
              d="M448 150 L470 190 L426 190 Z"
              fill="var(--brand-500)"
              strokeLinejoin="round"
            />
            <rect x="445" y="163" width="4" height="13" rx="2" fill="#fff" />
            <circle cx="447" cy="184" r="2.5" fill="#fff" />
          </g>
          <g opacity="0.9">
            <path
              d="M415 280 L449 340 L381 340 Z"
              fill="var(--brand-300)"
              strokeLinejoin="round"
            />
            <rect x="412" y="300" width="6" height="20" rx="3" fill="var(--brand-900)" />
            <circle cx="415" cy="330" r="3.5" fill="var(--brand-900)" />
          </g>

          {/* Ventana de navegador */}
          <rect
            x="96"
            y="60"
            width="300"
            height="230"
            rx="18"
            fill="#EAF3FF"
            stroke="var(--brand-300)"
            strokeWidth="2"
          />
          {/* Barra superior de la ventana */}
          <circle cx="122" cy="86" r="5" fill="var(--brand-500)" />
          <circle cx="140" cy="86" r="5" fill="var(--brand-300)" />
          <circle cx="158" cy="86" r="5" fill="var(--brand-300)" />
          <line
            x1="96"
            y1="108"
            x2="396"
            y2="108"
            stroke="var(--brand-300)"
            strokeWidth="1.5"
          />

          {/* Código 404 */}
          <text
            x="246"
            y="170"
            textAnchor="middle"
            fontSize="58"
            fontWeight="800"
            fill="var(--brand-900)"
            fontFamily="inherit"
          >
            {t("illustrationCode")}
          </text>
          {/* Etiqueta */}
          <text
            x="246"
            y="196"
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            letterSpacing="1.5"
            fill="var(--brand-500)"
            fontFamily="inherit"
          >
            {t("illustrationLabel")}
          </text>

          {/* Línea de pulso / heartbeat plano con un latido */}
          <polyline
            points="120,245 180,245 200,245 214,220 230,262 246,232 262,245 300,245 372,245"
            fill="none"
            stroke="var(--brand-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Barra de progreso con círculos (track roto) */}
          <line
            x1="150"
            y1="340"
            x2="342"
            y2="340"
            stroke="var(--brand-700)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="150" cy="340" r="12" fill="var(--brand-900)" stroke="var(--brand-300)" strokeWidth="3" />
          <circle cx="230" cy="340" r="9" fill="var(--brand-500)" />
          <circle cx="252" cy="340" r="9" fill="var(--brand-500)" />
          <circle cx="342" cy="340" r="12" fill="var(--brand-900)" stroke="var(--brand-300)" strokeWidth="3" />
        </svg>
      </div>

      <footer className={styles.footer}>{t("footer")}</footer>
    </div>
  );
}
