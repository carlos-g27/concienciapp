"use client";

import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/user-component/dashboard-logic/sidebar-config";
import { LogoutButton } from "@/components/logout-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Card from "@/components/ui/new-card"; // Asegúrate de que esta ruta sea correcta
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

// --- Subcomponente: fila de configuración adaptada con Card ---
function SettingsRow({ item }: { item: SettingsItem }) {
  const router = useRouter();

  const handleClick = () => {
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <Card isSelected={false} {...(item.action ? {} : { onClick: handleClick })}>
      <div className="flex items-center justify-between w-full">
        
        {/* Lado izquierdo: Icono y textos */}
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-primary">
            {item.icon}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-foreground">{item.label}</span>
            {item.description && (
              <span className="text-xs font-medium text-muted-foreground">{item.description}</span>
            )}
          </div>
        </div>

        {/* Lado derecho: Acción (ThemeSwitcher) o Flecha de navegación */}
        <div className="flex items-center flex-shrink-0" onClick={(e) => item.action && e.stopPropagation()}>
          {item.action ? (
            item.action
          ) : (
            <span className="text-accent">
              <IconChevron />
            </span>
          )}
        </div>

      </div>
    </Card>
  );
}

// --- Componente principal ---
export default function Settings() {
  return (
    <SidebarLayout pageTitle="Configuración">
      <div className="max-w-2xl mx-auto flex flex-col gap-8 w-full">

        {/* Título desktop */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Configuración</h1>
        </div>

        {/* Grupo: Cuenta */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
            Gestión de cuenta
          </h2>
          <div className="flex flex-col gap-3">
            {accountItems.map((item) => (
              <SettingsRow key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Grupo: Apariencia */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">
            Apariencia
          </h2>
          <div className="flex flex-col gap-3">
            <SettingsRow 
              item={{
                id: "theme",
                label: "Tema de la aplicación",
                description: "Cambia entre modo claro o modo oscuro",
                icon: <IconTheme />,
                action: <ThemeSwitcher />,
              }} 
            />
          </div>
        </section>

        {/* Botón cerrar sesión */}
        <section className="mt-4">
          <LogoutButton />
        </section>

      </div>
    </SidebarLayout>
  );
}