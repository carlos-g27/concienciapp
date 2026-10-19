"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface TabItem {
  key: string;
  label: string;
  /** Texto corto para móvil (ej. "Lun"); si no se pasa, se usa `label`. */
  shortLabel?: string;
  badge?: number;
}

interface TabbedCardProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: ReactNode;
}

export default function TabbedCard({ tabs, activeTab, onTabChange, children }: TabbedCardProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Pestañas de navegación: en móvil se reparten el ancho (todas visibles,
          sin scroll oculto); desde sm vuelven a su ancho natural. */}
      <div
        className="grid gap-1.5 pb-2 sm:flex sm:gap-2 sm:overflow-x-auto"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              title={tab.label}
              aria-pressed={isActive}
              className={`
                flex items-center justify-center gap-1.5 sm:gap-2 px-1.5 sm:px-5 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all min-w-0 sm:shrink-0
                ${isActive
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:border-muted-foreground"
                }
              `}
            >
              {tab.shortLabel ? (
                <>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </>
              ) : (
                <span className="truncate">{tab.label}</span>
              )}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span 
                  className={`
                    text-[0.7rem] font-bold px-1.5 py-[0.1rem] rounded-full
                    ${isActive ? "bg-white/25" : "bg-secondary text-primary"}
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenedor tipo Card */}
      <Card>
        <CardContent className="pt-6 flex flex-col gap-5">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}