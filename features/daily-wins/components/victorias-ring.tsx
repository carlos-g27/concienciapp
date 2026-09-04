"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const TRACK_COLOR = "hsl(var(--muted))";

/**
 * Color del arco según el % completado (cinco tramos).
 * 0% no pinta arco (solo la pista gris).
 */
function progressColor(percent: number): string {
  const p = percent / 100;
  if (p >= 1) return "#22D3EE"; // azul fluorescente (todo completado)
  if (p > 0.6) return "#22C55E"; // verde
  if (p > 0.4) return "#FACC15"; // amarillo
  if (p > 0.2) return "#F97316"; // naranja
  if (p > 0) return "#EF4444"; // rojo
  return "transparent"; // 0% → sin arco
}

export default function VictoriasRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const color = progressColor(clamped);

  return (
    <div className="relative w-[150px] h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Pista de fondo (círculo completo) */}
          <Pie
            data={[{ value: 1 }]}
            dataKey="value"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            fill={TRACK_COLOR}
            stroke="none"
            isAnimationActive={false}
          />
          {/* Arco de progreso (encima de la pista) */}
          <Pie
            data={[
              { name: "done", value: clamped },
              { name: "rest", value: 100 - clamped },
            ]}
            dataKey="value"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            cornerRadius={20}
            stroke="none"
            isAnimationActive={false}
          >
            <Cell fill={color} />
            <Cell fill="transparent" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Porcentaje al centro */}
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">
        {clamped}%
      </span>
    </div>
  );
}
