"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import PilarTogglePanel, { PilarToggleItem } from "@/components/ui/pilar-toggle-panel";
import { togglePilar } from "../actions";
import type { PilarKey, PilarSettingItem } from "../types";
import styles from "./admin-settings.module.css";

// --- Iconos ---
const IconTheme = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconWarning = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconFisico = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1" />
    <path d="M9 20l3-14 3 14" />
    <path d="M7 10h10" />
  </svg>
);

const IconNutricion = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
    <line x1="6" y1="1" x2="6" y2="4" />
    <line x1="10" y1="1" x2="10" y2="4" />
    <line x1="14" y1="1" x2="14" y2="4" />
  </svg>
);

const IconMental = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
  </svg>
);

const PILAR_META: { key: PilarKey; label: string; icon: React.ReactNode }[] = [
  { key: "fisico",    label: "Pilar Físico",     icon: <IconFisico /> },
  { key: "nutricion", label: "Pilar Nutrición",  icon: <IconNutricion /> },
  { key: "mental",    label: "Pilar Mental",     icon: <IconMental /> },
];

interface AdminSettingsViewProps {
  initialPilares: PilarSettingItem[];
}

export default function AdminSettingsView({ initialPilares }: AdminSettingsViewProps) {
  const [pilares, setPilares] = useState<PilarToggleItem[]>(
    PILAR_META.map((meta) => ({
      key: meta.key,
      label: meta.label,
      icon: meta.icon,
      enabled: initialPilares.find((p) => p.key === meta.key)?.enabled ?? true,
    }))
  );

  // Activar/desactivar un pilar — optimista con rollback si falla
  const handleTogglePilar = async (key: string, enabled: boolean) => {
    setPilares((prev) => prev.map((p) => (p.key === key ? { ...p, enabled } : p)));

    const res = await togglePilar(key as PilarKey, enabled);
    if (!res.success) {
      console.error("Error actualizando pilar:", res.error);
      setPilares((prev) => prev.map((p) => (p.key === key ? { ...p, enabled: !enabled } : p)));
    }
  };

  return (
    <div className={styles.page}>

      <h1 className={styles.pageTitle}>Configuración</h1>

      {/* ── Apariencia ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Apariencia</h2>
        <Card>
          <CardContent className="p-0">
            <div className={styles.row}>
              <div className={styles.rowIcon}><IconTheme /></div>
              <div className={styles.rowInfo}>
                <span className={styles.rowLabel}>Tema</span>
                <span className={styles.rowDescription}>Cambia entre modo claro, oscuro o sistema</span>
              </div>
              <ThemeSwitcher />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Cuenta ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cuenta</h2>
        <Card>
          <CardContent className="p-0">
            <Link href="/admin/settings/profile" className={`${styles.rowLink} ${styles.rowBorder}`}>
              <div className={styles.rowIcon}><IconUser /></div>
              <div className={styles.rowInfo}>
                <span className={styles.rowLabel}>Editar perfil</span>
                <span className={styles.rowDescription}>Actualiza tu foto, nombre y correo</span>
              </div>
              <span className={styles.rowChevron}><IconChevron /></span>
            </Link>

            <Link href="/auth/forgot-password" className={styles.rowLink}>
              <div className={styles.rowIcon}><IconLock /></div>
              <div className={styles.rowInfo}>
                <span className={styles.rowLabel}>Cambiar contraseña</span>
                <span className={styles.rowDescription}>Actualiza tu contraseña de acceso</span>
              </div>
              <span className={styles.rowChevron}><IconChevron /></span>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* ── Zona de administrador ── */}
      <section className={styles.section}>
        <h2 className={styles.dangerSectionTitle}>
          <IconWarning />
          Zona de administrador
        </h2>
        <Card className={styles.dangerCard}>
          <CardContent className="pt-6 flex flex-col gap-4">
            <div>
              <h3 className={styles.dangerCardTitle}>Disponibilidad de pilares</h3>
              <p className={styles.dangerCardDescription}>
                Desactiva temporalmente un pilar para hacer mantenimiento, sin afectar el resto de la aplicación.
              </p>
            </div>

            <PilarTogglePanel
              items={pilares}
              onToggle={handleTogglePilar}
              isLoading={false}
            />
          </CardContent>
        </Card>
      </section>

      {/* Botón cerrar sesión */}
      <section className="mt-4">
        <LogoutButton />
      </section>

    </div>
  );
}
