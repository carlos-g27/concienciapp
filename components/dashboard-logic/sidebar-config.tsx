"use client";

import { useState } from "react";
import Sidebar from "./sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  pageTitle?: string; // título opcional que aparece en el header móvil
}

export default function SidebarLayout({ children, pageTitle }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f8ff]">

      {/* Sidebar — fijo en desktop, deslizable en móvil */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Área derecha: topbar móvil + contenido de la página */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar — solo visible en móvil */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-[#DBEBFF] lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center p-2 rounded-lg text-[#223966] hover:bg-[#DBEBFF] transition-colors"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {pageTitle && (
            <span className="text-base font-bold text-[#061A33]">{pageTitle}</span>
          )}
        </header>

        {/* Contenido de cada página */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}