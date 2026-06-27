"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/dashboard-logic/sidebar-config";
import { ThemeSwitcher } from "@/components/theme-switcher";
import styles from "./settings.module.css";

// --- Tipos ---
interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  action?: React.ReactNode;
}

// --- Iconos ---
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconFaq = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const IconHelp = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

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

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// --- Grupos de configuración ---
const accountItems: SettingsItem[] = [
  {
    id: "password",
    label: "Cambiar contraseña",
    description: "Actualiza tu contraseña de acceso",
    icon: <IconLock />,
    href: "/auth/forgot-password",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Preguntas frecuentes",
    icon: <IconFaq />,
    href: "/settings/faq",
  },
  {
    id: "help",
    label: "Ayuda",
    description: "Centro de soporte",
    icon: <IconHelp />,
    href: "/settings/help",
  },
];

// --- Subcomponente: fila de configuración con Link ---
function SettingsRow({ item }: { item: SettingsItem }) {
  if (item.action) {
    return (
      <div className={styles.row}>
        <span className={styles.rowIcon}>{item.icon}</span>
        <div className={styles.rowInfo}>
          <span className={styles.rowLabel}>{item.label}</span>
          {item.description && (
            <span className={styles.rowDescription}>{item.description}</span>
          )}
        </div>
        <div className={styles.rowAction}>{item.action}</div>
      </div>
    );
  }

  return (
    <Link href={item.href!} className={styles.rowLink}>
      <span className={styles.rowIcon}>{item.icon}</span>
      <div className={styles.rowInfo}>
        <span className={styles.rowLabel}>{item.label}</span>
        {item.description && (
          <span className={styles.rowDescription}>{item.description}</span>
        )}
      </div>
      <span className={styles.rowChevron}><IconChevron /></span>
    </Link>
  );
}

// --- Componente principal ---
export default function Settings() {
  const router = useRouter();

  const handleLogout = async () => {
    // Lógica de cierre de sesión — conectar con Supabase después
    router.push("/auth/login");
  };

  return (
    <SidebarLayout pageTitle="Configuración">
      <div className={styles.page}>

        {/* Título desktop */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Configuración</h1>
        </div>

        {/* Grupo: Cuenta */}
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Gestión de cuenta</h2>
          <div className={styles.groupCard}>
            {accountItems.map((item, i) => (
              <div key={item.id}>
                <SettingsRow item={item} />
                {i < accountItems.length - 1 && <div className={styles.divider} />}
              </div>
            ))}
          </div>
        </section>

        {/* Grupo: Apariencia */}
        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Apariencia</h2>
          <div className={styles.groupCard}>
            <div className={styles.row}>
              <span className={styles.rowIcon}><IconTheme /></span>
              <div className={styles.rowInfo}>
                <span className={styles.rowLabel}>Tema</span>
                <span className={styles.rowDescription}>Cambia entre modo claro, oscuro o sistema</span>
              </div>
              <div className={styles.rowAction}>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </section>

        {/* Botón cerrar sesión */}
        <section className={styles.group}>
          <div className={styles.groupCard}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <IconLogout />
              Cerrar sesión
            </button>
          </div>
        </section>

      </div>
    </SidebarLayout>
  );
}