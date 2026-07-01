"use client";

import { useState } from "react";
import { ProfileProvider } from "@/hooks/use-profile";
import AdminSidebar from "../../components/admin-component/admin-sidebar";


interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AdminLayout({ children, pageTitle }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProfileProvider>
      <div className="flex min-h-screen bg-background">

        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">

          {/* Topbar móvil */}
          <header className="flex items-center gap-3 px-4 py-4 bg-card border-b border-border lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center p-2 rounded-lg text-primary hover:bg-secondary transition-colors"
            aria-label="Abrir menú"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {pageTitle && (
            <span className="text-base font-bold text-foreground">{pageTitle}</span>
          )}
        </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>

        </div>
      </div>
    </ProfileProvider>
  );
}