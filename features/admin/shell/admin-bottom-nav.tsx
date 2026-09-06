"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

// --- Tipos ---
interface AdminNavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  isActive: (pathname: string) => boolean;
}

// Íconos (mismos glyphs que el admin-sidebar) definidos localmente.
const items: AdminNavItem[] = [
  {
    key: "users",
    href: "/admin",
    isActive: (p) => p === "/admin" || p.startsWith("/admin/users"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "tabExercises",
    href: "/admin/catalog/exercises",
    isActive: (p) => p.startsWith("/admin/catalog/exercises") || p.startsWith("/admin/exercises"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1" />
        <path d="M9 20l3-14 3 14" />
        <path d="M7 10h10" />
      </svg>
    ),
  },
  {
    key: "tabRecipes",
    href: "/admin/catalog/recipes",
    isActive: (p) => p.startsWith("/admin/catalog/recipes") || p.startsWith("/admin/recipes"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    key: "tabMeditations",
    href: "/admin/catalog/meditations",
    isActive: (p) => p.startsWith("/admin/catalog/meditations"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
      </svg>
    ),
  },
];

/**
 * Barra de navegación inferior del admin — solo en móvil. Coloca las
 * secciones principales en la zona del pulgar, al estilo de una app nativa.
 */
export default function AdminBottomNav() {
  const pathname = usePathname();
  const t = useTranslations("adminNav");

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 lg:hidden bg-card/85 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={t("adminLabel")}
    >
      <ul className="flex items-stretch justify-around h-16">
        {items.map((item) => {
          const active = item.isActive(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`
                  relative flex flex-col items-center justify-center gap-1 h-full
                  transition-transform active:scale-95
                  ${active ? "text-primary" : "text-muted-foreground hover:text-primary"}
                `}
              >
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.icon}</span>
                <span className={`text-[0.65rem] ${active ? "font-semibold" : "font-medium"}`}>
                  {t(item.key)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
