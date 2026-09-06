"use client";

import { useTranslations } from "next-intl";
import AppSidebar from "./app-sidebar";
import BottomNav from "./bottom-nav";
import AccountMenu from "./account-menu";
import type { ShellData } from "./types";

interface ShellFrameProps {
  data: ShellData;
  children: React.ReactNode;
}

export default function ShellFrame({ data, children }: ShellFrameProps) {
  const t = useTranslations("common");
  const firstName = data.profile.name?.trim().split(" ")[0] || "";

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar — solo escritorio */}
      <AppSidebar profile={data.profile} pilares={data.pilares} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar minimalista — solo móvil, no anclado (scrollea con el contenido) */}
        <header className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="text-lg font-bold text-foreground truncate">
            {firstName ? `${t("hi")}, ${firstName}` : t("hi")}
          </span>
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
