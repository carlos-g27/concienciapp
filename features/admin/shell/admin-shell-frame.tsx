"use client";

import { useTranslations } from "next-intl";
import AdminSidebar from "./admin-sidebar";
import AdminBottomNav from "./admin-bottom-nav";
import AdminAccountMenu from "./admin-account-menu";
import type { ShellProfile } from "@/features/shell/types";

interface AdminShellFrameProps {
  profile: ShellProfile;
  children: React.ReactNode;
}

export default function AdminShellFrame({ profile, children }: AdminShellFrameProps) {
  const t = useTranslations("common");
  const firstName = profile.name?.trim().split(" ")[0] || "";

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar — solo escritorio */}
      <AdminSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar minimalista — solo móvil, no anclado (scrollea con el contenido) */}
        <header className="flex items-center justify-between px-4 py-4 lg:hidden">
          <span className="text-lg font-bold text-foreground truncate">
            {firstName ? `${t("hi")}, ${firstName}` : t("hi")}
          </span>
          <AdminAccountMenu profile={profile} />
        </header>

        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Barra de navegación inferior — solo en móvil */}
      <AdminBottomNav />
    </div>
  );
}
