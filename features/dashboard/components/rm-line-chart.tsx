"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RmProgress } from "../types";

// Colores por ejercicio (visibles en claro y oscuro).
const COLORS = ["#528ACC", "#4ade80", "#f59e0b"];

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default function RmLineChart({ data }: { data: RmProgress }) {
  if (data.points.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-10">
        Aún no hay registros de RM. Se mostrarán aquí a medida que se registren.
      </p>
    );
  }

  return (
    <div className="w-full text-muted-foreground" style={{ height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data.points} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
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
            formatter={(value, name) => [`${value} kg`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {data.exercises.map((exercise, i) => (
            <Line
              key={exercise}
              type="monotone"
              dataKey={exercise}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
