"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { getInitials } from "@/hooks/use-profile";
import AppSidebar from "./app-sidebar";
import BottomNav from "./bottom-nav";
import type { ShellData } from "./types";

// Mapa de ruta → clave de traducción del título del topbar móvil.
const PAGE_TITLE_KEYS: Record<string, string> = {
  "/dashboard": "dashboard",
  "/victorias": "victorias",
  "/profile": "profile",
  "/pilar-fisico": "fisico",
  "/pilar-nutricion": "nutricion",
  "/pilar-mental": "mental",
  "/settings": "settings",
  "/settings/faq": "faq",
  "/settings/help": "help",
};

interface ShellFrameProps {
  data: ShellData;
  children: React.ReactNode;
}

export default function ShellFrame({ data, children }: ShellFrameProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("pageTitles");
  const tNav = useTranslations("nav");
  const titleKey = PAGE_TITLE_KEYS[pathname];
  const pageTitle = titleKey ? t(titleKey) : "";

  // Sombra sutil del topbar al hacer scroll (efecto de elevación).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">

      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={data.profile}
        pilares={data.pilares}
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar — solo visible en móvil */}
        <header
          className={`sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border lg:hidden transition-shadow ${
            scrolled ? "shadow-md" : ""
          }`}
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex items-center justify-between h-14 px-4">
            <span className="text-lg font-bold text-foreground truncate">
              {pageTitle}
            </span>
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex-shrink-0 rounded-full transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={tNav("openMenu")}
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#528ACC] to-[#9BC7FF] text-white text-sm font-bold shadow-sm select-none overflow-hidden">
                {data.profile.avatar_url ? (
                  <Image
                    src={data.profile.avatar_url}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  getInitials(data.profile.name ?? "?") || "?"
                )}
              </span>
            </button>
          </div>
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
