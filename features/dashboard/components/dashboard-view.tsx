// Vista del dashboard (Server Component). Recibe los datos por props desde la
// página server y compone la UI. La interacción vive en <DashboardTabs/>.

import SidebarLayout from "@/components/user-component/dashboard-logic/sidebar-config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DonutRing from "./donut-ring";
import BarChart from "./bar-chart";
import DashboardTabs from "./dashboard-tabs";
import type { DashboardData, PilarKey } from "../types";
import styles from "./donut-ring.module.css";

// Mapeo de cada pilar a sus clases de color (presentación).
const PILAR_STYLES: Record<PilarKey, { colorClass: string; trackClass: string }> = {
  fisico: { colorClass: styles.pilarGreen, trackClass: styles.trackGreen },
  nutricion: { colorClass: styles.pilarLightBlue, trackClass: styles.trackLightBlue },
  mental: { colorClass: styles.pilarBlue, trackClass: styles.trackBlue },
};

export default function DashboardView({ data }: { data: DashboardData }) {
  return (
    <SidebarLayout pageTitle="Progress">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Título de página — solo visible en desktop (en móvil ya está en el topbar) */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Progress</h1>
        </div>

        {/* Tab Bar (island interactivo) */}
        <DashboardTabs />

        {/* Grid principal */}
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
                  {data.pilares.map((p) => (
                    <div key={p.key} className="flex flex-col items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground text-center leading-snug">
                        {p.label}
                      </span>
                      <DonutRing
                        value={p.value}
                        colorClass={PILAR_STYLES[p.key].colorClass}
                        trackClass={PILAR_STYLES[p.key].trackClass}
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
                  <BarChart data={data.rendimiento} />
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </SidebarLayout>
  );
}
