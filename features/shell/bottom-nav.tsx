"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ShellPilares } from "./types";

// --- Tipos ---
interface BottomNavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
}

// Mapeo de rutas de pilares a su clave, para saber si están en mantenimiento.
const PILAR_HREF_MAP: Partial<Record<string, keyof ShellPilares>> = {
  "/pilar-fisico": "fisico",
  "/pilar-nutricion": "nutricion",
  "/pilar-mental": "mental",
};

// Íconos (mismos glyphs que el sidebar) definidos localmente para no tocar
// el archivo del sidebar que ya funciona.
const items: BottomNavItem[] = [
  {
    key: "home",
    href: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: "fisico",
    href: "/pilar-fisico",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1" />
        <path d="M9 20l3-14 3 14" />
        <path d="M7 10h10" />
      </svg>
    ),
  },
  {
    key: "nutricion",
    href: "/pilar-nutricion",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: "mental",
    href: "/pilar-mental",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 3.6-2.1 6.7-5.1 8.2L15 21H9l-.9-1.8A9 9 0 0 1 3 11a9 9 0 0 1 9-9z" />
        <path d="M9 12h.01M12 12h.01M15 12h.01" />
      </svg>
    ),
  },
  {
    key: "profile",
    href: "/profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

interface BottomNavProps {
  pilares: ShellPilares;
}

/**
 * Barra de navegación inferior — solo en móvil. Coloca la navegación
 * principal en la zona del pulgar, al estilo de una app nativa.
 */
export default function BottomNav({ pilares }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 lg:hidden bg-card/85 backdrop-blur-md border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label={t("home")}
    >
      <ul className="flex items-stretch justify-around h-16">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const pilarKey = PILAR_HREF_MAP[item.href];
          const isDisabled = pilarKey ? !pilares[pilarKey] : false;

          const label = t(item.key);

          if (isDisabled) {
            return (
              <li key={item.href} className="flex-1">
                <div
                  className="flex flex-col items-center justify-center gap-1 h-full text-muted-foreground opacity-40 cursor-not-allowed select-none"
                  aria-disabled="true"
                  title={t("maintenance")}
                >
                  <span>{item.icon}</span>
                  <span className="text-[0.65rem] font-medium">{label}</span>
                </div>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex flex-col items-center justify-center gap-1 h-full
                  transition-transform active:scale-95
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary"}
                `}
              >
                {/* Indicador superior del tab activo */}
                <span
                  className={`absolute top-0 h-0.5 w-8 rounded-full bg-primary transition-opacity ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.icon}</span>
                <span className={`text-[0.65rem] ${isActive ? "font-semibold" : "font-medium"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
