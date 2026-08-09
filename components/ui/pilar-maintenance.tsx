"use client";

import Link from "next/link";
import styles from "./pilar-maintenance.module.css";

interface PilarMaintenanceProps {
  pilarName: string;
}

export default function PilarMaintenance({ pilarName }: PilarMaintenanceProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.iconWrapper}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      <h2 className={styles.title}>{pilarName} en mantenimiento</h2>
      <p className={styles.description}>
        Estamos realizando mejoras en esta sección. Vuelve a intentarlo más tarde.
      </p>
      <Link href="/dashboard" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver al inicio
      </Link>
    </div>
  );
}