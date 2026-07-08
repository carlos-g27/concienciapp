"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile, getInitials } from "@/hooks/use-profile";

// --- Tipos ---
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// --- Items de navegación ---
const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Físico",
    href: "/pilar-fisico",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1" />
        <path d="M9 20l3-14 3 14" />
        <path d="M7 10h10" />
      </svg>
    ),
  },
  {
    label: "Nutrición",
    href: "/pilar-nutricion",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: "Mental",
    href: "/pilar-mental",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.1 6.7-5.1 8.2L15 21H9l-.9-1.8A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
        <path d="M9 12h.01M12 12h.01M15 12h.01" />
      </svg>
    ),
  },
];

const settingsItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

// --- Props ---
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Componente principal ---
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, isLoading: loadingProfile } = useProfile();

  return (
    <>
      {/* Overlay oscuro — solo en móvil cuando está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          bg-card border-r border-border shadow-lg
          w-64
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:shadow-none lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Botón cerrar — solo visible en móvil */}
        <div className="flex items-center justify-end p-4 lg:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            aria-label="Cerrar menú"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Perfil del usuario */}
        <div className="flex flex-col items-center gap-2 px-6 py-6 border-b border-border">
          {loadingProfile ? (
            /* Skeleton mientras carga */
            <div className="flex flex-col items-center gap-2 w-full animate-pulse">
              <div className="w-16 h-16 rounded-full bg-secondary" />
              <div className="h-3.5 w-28 rounded bg-secondary mt-1" />
              <div className="h-3 w-36 rounded bg-secondary" />
            </div>
          ) : (
            <>
              {/* Avatar: foto si existe, iniciales si no */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#528ACC] to-[#9BC7FF] flex items-center justify-center text-white text-lg font-bold shadow-md select-none overflow-hidden">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Foto de perfil"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  getInitials(profile?.name ?? "?") || "?"
                )}
              </div>
              <div className="text-center mt-1">
                <p className="text-sm font-bold text-foreground">
                  {profile?.name ?? "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                  {profile?.email ?? ""}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${
                    isActive
                      ? "bg-secondary text-primary font-semibold"
                      : "text-muted-foreground hover:bg-background hover:text-primary"
                  }
                `}
              >
                <span
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? "text-primary" : "text-accent group-hover:text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings — fijo al fondo */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href={settingsItem.href}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${
                pathname === settingsItem.href
                  ? "bg-secondary text-primary font-semibold"
                  : "text-muted-foreground hover:bg-background hover:text-primary"
              }
            `}
          >
            <span className={`flex-shrink-0 transition-colors ${
              pathname === settingsItem.href ? "text-primary" : "text-accent group-hover:text-muted-foreground"
            }`}>
              {settingsItem.icon}
            </span>
            <span>{settingsItem.label}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}