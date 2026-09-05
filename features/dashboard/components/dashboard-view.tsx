// Vista del dashboard (Server Component). Recibe los datos por props desde la
// página server y compone la UI. La interacción vive en <DashboardTabs/>.

import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RmLineChart from "./rm-line-chart";
import DashboardTabs from "./dashboard-tabs";
import VictoriasDeHoyCard from "@/features/daily-wins/components/victorias-de-hoy-card";
import type { DashboardData } from "../types";

export default async function DashboardView({ data }: { data: DashboardData }) {
  const t = await getTranslations("dashboard");

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Título de página — solo visible en desktop (en móvil ya está en el topbar) */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{t("progress")}</h1>
        </div>

        {/* Tab Bar (island interactivo) */}
        <DashboardTabs />

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna derecha (en móvil, arriba) — Victorias de hoy */}
          <div className="flex flex-col gap-6 lg:order-2">
            {/* Card: Victorias de hoy (datos reales) */}
            <VictoriasDeHoyCard data={data.todayWins} />
          </div>

          {/* Columna izquierda ancha (en móvil, abajo) — Progreso de RM */}
          <div className="lg:col-span-2 lg:order-1 flex flex-col gap-6">
            {/* Card: Progreso de RM (datos reales) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold text-primary">{t("rmTitle")}</CardTitle>
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
