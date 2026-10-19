"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ExerciseRm } from "../types";

const LINE_COLOR = "#528ACC";

type RangeKey = "3m" | "6m" | "1y" | "all";

// Periodos del selector; `months: null` = todo el historial (por defecto).
const RANGES: { key: RangeKey; months: number | null }[] = [
  { key: "3m", months: 3 },
  { key: "6m", months: 6 },
  { key: "1y", months: 12 },
  { key: "all", months: null },
];

/** Fecha local (YYYY-MM-DD) de hace `months` meses. */
function cutoffDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function RmLineChart({ data }: { data: ExerciseRm[] }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "es-ES";

  const formatDate = (iso: string, withYear = false): string => {
    const d = new Date(`${iso}T00:00:00`);
    return d.toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "short",
      ...(withYear ? { year: "numeric" } : {}),
    });
  };

  // Selección inicial: primer ejercicio con datos; si ninguno tiene, el primero.
  const initial = data.find((d) => d.points.length > 0)?.name ?? data[0]?.name ?? "";
  const [selected, setSelected] = useState(initial);
  const [range, setRange] = useState<RangeKey>("all");

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        {t("rmNoMainLifts")}
      </p>
    );
  }

  const current = data.find((d) => d.name === selected) ?? data[0];

  // Filtro por periodo en el cliente: ya llega todo el historial (pocos puntos,
  // un RM cada 4 semanas), así que cambiar de periodo es instantáneo.
  const months = RANGES.find((r) => r.key === range)?.months ?? null;
  const cutoff = months ? cutoffDate(months) : null;
  const points = cutoff ? current.points.filter((p) => p.date >= cutoff) : current.points;

  // Si los puntos abarcan más de un año, el eje X muestra también el año.
  const spansYears =
    points.length > 1 && points[0].date.slice(0, 4) !== points[points.length - 1].date.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Selector de ejercicio */}
        <div className="flex flex-wrap gap-2">
          {data.map((ex) => {
            const isActive = ex.name === current.name;
            return (
              <button
                key={ex.name}
                type="button"
                onClick={() => setSelected(ex.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-primary"
                }`}
              >
                {ex.name}
              </button>
            );
          })}
        </div>

        {/* Selector de periodo */}
        <div
          role="group"
          aria-label={t("rangeLabel")}
          className="inline-flex rounded-lg border border-border bg-background p-0.5"
        >
          {RANGES.map((r) => {
            const isActive = r.key === range;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                aria-pressed={isActive}
                title={t(`range_${r.key}_full`)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {t(`range_${r.key}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfico o estado vacío */}
      {current.points.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {t("rmNoData")}
        </p>
      ) : points.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          {t("rmNoDataRange")}
        </p>
      ) : (
        <div className="w-full text-muted-foreground" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
              <XAxis
                dataKey="date"
                tickFormatter={(iso) => formatDate(String(iso), spansYears)}
                tick={{ fill: "currentColor", fontSize: 11 }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis
                unit={t("kgUnit")}
                width={56}
                tick={{ fill: "currentColor", fontSize: 11 }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(String(label), true)}
                formatter={(value) => [`${value}${t("kgUnit")}`, current.name]}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name={current.name}
                stroke={LINE_COLOR}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
