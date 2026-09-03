"use client";

import { useState } from "react";
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

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function RmLineChart({ data }: { data: ExerciseRm[] }) {
  // Selección inicial: primer ejercicio con datos; si ninguno tiene, el primero.
  const initial = data.find((d) => d.points.length > 0)?.name ?? data[0]?.name ?? "";
  const [selected, setSelected] = useState(initial);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Aún no hay ejercicios principales configurados.
      </p>
    );
  }

  const current = data.find((d) => d.name === selected) ?? data[0];

  return (
    <div className="flex flex-col gap-4">
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

      {/* Gráfico o estado vacío */}
      {current.points.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          Cuando marques tu primer RM, lo podrás ver aquí.
        </p>
      ) : (
        <div className="w-full text-muted-foreground" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={current.points} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: "currentColor", fontSize: 11 }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <YAxis
                unit=" kg"
                width={56}
                tick={{ fill: "currentColor", fontSize: 11 }}
                stroke="currentColor"
                strokeOpacity={0.3}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value) => [`${value} kg`, current.name]}
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
