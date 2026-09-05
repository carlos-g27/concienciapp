"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getInitials } from "@/hooks/use-profile";
import type { ShellProfile } from "@/features/shell/types";

// --- Tipos ---
interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// --- Items de navegación del admin ---
const navItems: NavItem[] = [
  {
    label: "Usuarios",
    href: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Catálogo ejercicios",
    href: "/admin/catalog/exercises",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1" />
        <path d="M9 20l3-14 3 14" />
        <path d="M7 10h10" />
      </svg>
    ),
  },
  {
    label: "Catálogo recetas",
    href: "/admin/catalog/recipes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    label: "Catálogo meditaciones",
    href: "/admin/catalog/meditations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
  },
];

const settingsItem: NavItem = {
  label: "Configuración",
  href: "/admin/settings",
  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

// --- Props ---
interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ShellProfile;
}

export default function AdminSidebar({ isOpen, onClose, profile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-card border-r border-border shadow-lg w-64
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/* Botón cerrar — móvil */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Admin</span>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors" aria-label="Cerrar menú">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Badge admin + perfil */}
        <div className="flex flex-col items-center gap-2 px-6 py-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#528ACC] to-[#9BC7FF] flex items-center justify-center text-white text-lg font-bold shadow-md select-none overflow-hidden">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Foto de perfil" width={64} height={64} loading="eager" className="object-cover w-full h-full" />
            ) : (
              getInitials(profile.name ?? "?") || "?"
            )}
          </div>
          <div className="text-center mt-1">
            <p className="text-sm font-bold text-foreground">{profile.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">{profile.email || ""}</p>
            {/* Badge de rol */}
            <span className="inline-block mt-1.5 text-[0.65rem] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
              Administrador
            </span>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:bg-background hover:text-primary"
                  }
                `}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? "text-primary" : "text-accent group-hover:text-muted-foreground"}`}>
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

        {/* Settings */}
        <div className="px-3 py-4 border-t border-border">
          <Link
            href={settingsItem.href}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${pathname === settingsItem.href
                ? "bg-secondary text-primary font-semibold"
                : "text-muted-foreground hover:bg-background hover:text-primary"
              }
            `}
          >
            <span className={`flex-shrink-0 transition-colors ${pathname === settingsItem.href ? "text-primary" : "text-accent group-hover:text-muted-foreground"}`}>
              {settingsItem.icon}
            </span>
            <span>{settingsItem.label}</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
