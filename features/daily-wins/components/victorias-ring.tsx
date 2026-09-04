"use client";

import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const TRACK_COLOR = "hsl(var(--muted))";
const ANIM_MS = 600;

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
  const target = Math.max(0, Math.min(100, Math.round(percent)));

  // Valor animado: se acerca a `target` con easing al cambiar el porcentaje,
  // de modo que el número y el arco se llenan progresivamente a la vez.
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const value = from + (to - from) * eased;
      displayRef.current = value;
      setDisplay(value);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  const color = progressColor(display);

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
              { name: "done", value: display },
              { name: "rest", value: 100 - display },
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
      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary">
        {Math.round(display)}%
      </span>
    </div>
  );
}
