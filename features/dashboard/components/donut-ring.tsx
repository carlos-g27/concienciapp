// Componente presentacional (Server Component): anillo de progreso con SVG.

interface DonutRingProps {
  value: number;
  colorClass: string;
  trackClass: string;
}

export default function DonutRing({ value, colorClass, trackClass }: DonutRingProps) {
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
