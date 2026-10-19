"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import AppSidebar from "./app-sidebar";
import BottomNav from "./bottom-nav";
import AccountMenu from "./account-menu";
import type { ShellData } from "./types";

interface ShellFrameProps {
  data: ShellData;
  children: React.ReactNode;
}

// Ruta → clave de `pageTitles` (la más específica primero).
const SECTION_TITLES: { prefix: string; key: string }[] = [
  { prefix: "/settings/faq", key: "faq" },
  { prefix: "/settings/help", key: "help" },
  { prefix: "/settings", key: "settings" },
  { prefix: "/dashboard", key: "dashboard" },
  { prefix: "/victorias", key: "victorias" },
  { prefix: "/profile", key: "profile" },
  { prefix: "/pilar-fisico", key: "fisico" },
  { prefix: "/pilar-nutricion", key: "nutricion" },
  { prefix: "/pilar-mental", key: "mental" },
];

export default function ShellFrame({ data, children }: ShellFrameProps) {
  const t = useTranslations("common");
  const tTitles = useTranslations("pageTitles");
  const pathname = usePathname();
  const firstName = data.profile.name?.trim().split(" ")[0] || "";
  const greeting = firstName ? `${t("hi")}, ${firstName}` : t("hi");
  const sectionKey = SECTION_TITLES.find((s) => pathname.startsWith(s.prefix))?.key;

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar — solo escritorio */}
      <AppSidebar profile={data.profile} pilares={data.pilares} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar — solo móvil, no anclado. Muestra la sección actual (en
            escritorio cada página tiene su propio título); en el dashboard,
            además, el saludo. */}
        <header className="flex items-center justify-between gap-3 px-4 py-4 lg:hidden">
          <div className="flex flex-col min-w-0">
            {sectionKey === "dashboard" && (
              <span className="text-xs font-medium text-muted-foreground truncate">{greeting}</span>
            )}
            <p className="text-xl font-bold text-foreground tracking-tight truncate">
              {sectionKey ? tTitles(sectionKey) : greeting}
            </p>
          </div>
          <AccountMenu profile={data.profile} />
        </header>

        {/* Contenido de cada página */}
        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Barra de navegación inferior — solo en móvil */}
      <BottomNav pilares={data.pilares} />
    </div>
  );
}
