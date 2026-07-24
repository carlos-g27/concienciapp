"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface TabItem {
  key: string;
  label: string;
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
      {/* Pestañas de navegación */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap transition-all shrink-0
                ${isActive 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "bg-card border-border text-muted-foreground hover:border-muted-foreground"
                }
              `}
            >
              {tab.label}
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