"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import MobileTopbar from "@/components/layout/mobile-topbar";
import AdminSidebar from "./admin-sidebar";
import AdminBottomNav from "./admin-bottom-nav";
import AdminAccountMenu from "./admin-account-menu";
import type { ShellProfile } from "@/features/shell/types";

interface AdminShellFrameProps {
  profile: ShellProfile;
  children: React.ReactNode;
}

// Ruta → clave de `adminPageTitles` (la más específica primero). Los
// formularios de crear/editar cuentan como parte de su catálogo.
const SECTION_TITLES: { match: (p: string) => boolean; key: string }[] = [
  { match: (p) => p.startsWith("/admin/catalog/exercises") || p.startsWith("/admin/exercises"), key: "exercises" },
  { match: (p) => p.startsWith("/admin/catalog/recipes") || p.startsWith("/admin/recipes"), key: "recipes" },
  { match: (p) => p.startsWith("/admin/catalog/meditations") || p.startsWith("/admin/meditations"), key: "meditations" },
  { match: (p) => p.startsWith("/admin/settings/profile"), key: "profile" },
  { match: (p) => p.startsWith("/admin/settings"), key: "settings" },
  { match: (p) => p.startsWith("/admin/users"), key: "users" },
  { match: (p) => p === "/admin", key: "dashboard" },
];

export default function AdminShellFrame({ profile, children }: AdminShellFrameProps) {
  const t = useTranslations("common");
  const tTitles = useTranslations("adminPageTitles");
  const pathname = usePathname();
  const firstName = profile.name?.trim().split(" ")[0] || "";
  const greeting = firstName ? `${t("hi")}, ${firstName}` : t("hi");
  const sectionKey = SECTION_TITLES.find((s) => s.match(pathname))?.key;

  return (
    // Los ejemplos ("Ej.: …") de los formularios del admin se ven más tenues y en
    // cursiva, para no confundirlos con un valor ya escrito.
    <div className="flex min-h-screen bg-background [&_::placeholder]:italic [&_::placeholder]:opacity-60">

      {/* Sidebar — solo escritorio */}
      <AdminSidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar móvil: la sección actual, igual que en el área del usuario;
            en el panel principal, además, el saludo. */}
        <MobileTopbar
          title={sectionKey ? tTitles(sectionKey) : greeting}
          greeting={sectionKey === "dashboard" ? greeting : undefined}
        >
          <AdminAccountMenu profile={profile} />
        </MobileTopbar>

        <main className="flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Barra de navegación inferior — solo en móvil */}
      <AdminBottomNav />
    </div>
  );
}
