// Componente presentacional (Server Component): gráfica de barras de rendimiento.

import type { RendimientoPunto } from "../types";

interface BarChartProps {
  data: RendimientoPunto[];
}

export default function BarChart({ data }: BarChartProps) {
  const maxVal = 100;
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {data.map((item) => (
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
