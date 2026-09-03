// Vista del dashboard (Server Component). Recibe los datos por props desde la
// página server y compone la UI. La interacción vive en <DashboardTabs/>.

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import DonutRing from "./donut-ring";
import RmLineChart from "./rm-line-chart";
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

            {/* Card: Progreso de RM (datos reales) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-primary">Progreso de RM (kg)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gradient-to-br from-background to-secondary rounded-xl p-4 border border-border">
                  <RmLineChart data={data.rmProgress} />
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
  );
}
