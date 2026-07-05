"use client";

import SidebarLayout from "./sidebar-config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import styles from "./dashboard.module.css";

// --- Tipos ---
interface Pilar {
  label: string;
  value: number;
  colorClass: string;
  trackClass: string;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  avatar: string;
}

// --- Datos mock (sin lógica real aún) ---
const pilares: Pilar[] = [
  { label: "Pilar físico",    value: 64, colorClass: styles.pilarGreen,     trackClass: styles.trackGreen },
  { label: "Pilar nutrición", value: 40, colorClass: styles.pilarLightBlue, trackClass: styles.trackLightBlue },
  { label: "Pilar mental",    value: 90, colorClass: styles.pilarBlue,      trackClass: styles.trackBlue },
];

const rendimientoData = [
  { month: "Ene", prev: 40, curr: 55 },
  { month: "Feb", prev: 55, curr: 70 },
  { month: "Mar", prev: 35, curr: 45 },
  { month: "Abr", prev: 60, curr: 80 },
  { month: "May", prev: 50, curr: 65 },
  { month: "Jun", prev: 45, curr: 90 },
  { month: "Jul", prev: 70, curr: 85 },
];

const leaderboard: LeaderboardEntry[] = [
  { name: "Ada Lovelace",      score: 27, avatar: "AL" },
  { name: "Mark Hopper",       score: 21, avatar: "MH" },
  { name: "Margaret Hamilton", score: 15, avatar: "MH" },
];

// --- Subcomponente: Donut circular con SVG ---
function DonutRing({
  value,
  colorClass,
  trackClass,
}: {
  value: number;
  colorClass: string;
  trackClass: string;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const progress = circ - (value / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className={trackClass} />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className={colorClass}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-primary">{value}%</span>
    </div>
  );
}

// --- Subcomponente: Gráfica de barras ---
function BarChart() {
  const maxVal = 100;
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {rendimientoData.map((item) => (
        <div key={item.month} className="flex flex-col items-center gap-1 flex-1 h-full">
          <div className="flex items-end gap-[3px] flex-1 w-full">
            <div
              className="flex-1 rounded-t bg-accent opacity-60"
              style={{ height: `${(item.prev / maxVal) * 100}%` }}
            />
            <div
              className="flex-1 rounded-t bg-primary"
              style={{ height: `${(item.curr / maxVal) * 100}%` }}
            />
          </div>
          <span className="text-[0.65rem] text-muted-foreground font-medium">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

// --- Subcomponente: Avatar con iniciales ---
function AvatarInitials({ initials }: { initials: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted-foreground to-accent flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0 tracking-wide">
      {initials}
    </div>
  );
}

// --- Componente principal: Dashboard ---
export default function Dashboard() {
  return (
    <SidebarLayout pageTitle="Progress">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Título de página — solo visible en desktop (en móvil ya está en el topbar) */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Progress</h1>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-6 border-b-2 border-border">
          <button className="relative pb-3 text-sm font-bold text-primary after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary after:rounded-t">
            Improvement
          </button>
          <button className="pb-3 text-sm font-medium text-accent hover:text-muted-foreground transition-colors">
            General
          </button>
        </div>

        {/* Grid principal: 2 columnas en lg, 1 columna en móvil/tablet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna izquierda — Pilares + Rendimiento */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Card: Pilares */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-primary">Pilares</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 sm:gap-8">
                  {pilares.map((p) => (
                    <div key={p.label} className="flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground text-center leading-snug">
                        {p.label}
                      </span>
                      <DonutRing
                        value={p.value}
                        colorClass={p.colorClass}
                        trackClass={p.trackClass}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card: Rendimiento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-bold text-primary">Rendimiento</CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-accent opacity-60 inline-block" />
                    Período anterior
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
                    Período actual
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gradient-to-br from-background to-secondary rounded-xl p-4 border border-border">
                  <BarChart />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Columna derecha — Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold text-primary">Leaderboard</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex flex-col gap-1">
                {leaderboard.map((entry, i) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-colors cursor-default"
                  >
                    <span
                      className={`w-5 text-center text-sm font-bold flex-shrink-0 ${
                        i === 0 ? "text-primary" : "text-accent"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <AvatarInitials initials={entry.avatar} />
                    <span className="flex-1 text-sm font-medium text-primary truncate">
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-muted-foreground">{entry.score}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </SidebarLayout>
  );
}