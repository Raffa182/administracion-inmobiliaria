import { formatEUR } from "@/lib/format";

type Punto = { label: string; amount: number; current?: boolean };

// SVG simple sin librería: 6 barras no justifican sumar una dependencia.
// Los colores van por clases fill-*/stroke-* (no atributos fill= hex) para
// que respondan a dark: igual que el resto de la UI.
export function IngresosChart({ data }: { data: Punto[] }) {
  const width = 560;
  const height = 200;
  const paddingBottom = 28;
  const paddingTop = 24;
  const plotHeight = height - paddingBottom - paddingTop;
  const barGap = 16;
  const barWidth = (width - barGap * (data.length - 1)) / data.length;
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Ingresos cobrados por mes"
      className="w-full h-auto"
    >
      <line
        x1={0}
        y1={height - paddingBottom}
        x2={width}
        y2={height - paddingBottom}
        strokeWidth={1}
        className="stroke-slate-200 dark:stroke-slate-700"
      />
      {data.map((d, i) => {
        const barHeight = (d.amount / max) * plotHeight;
        const x = i * (barWidth + barGap);
        const y = height - paddingBottom - barHeight;
        const barFill =
          d.amount === 0
            ? "fill-slate-200 dark:fill-slate-700"
            : d.current
            ? "fill-emerald-600 dark:fill-emerald-400"
            : "fill-emerald-200 dark:fill-emerald-800";
        return (
          <g key={d.label}>
            <title>{`${d.label}: ${formatEUR(d.amount)}`}</title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={4}
              className={barFill}
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              className="fill-slate-700 dark:fill-slate-300"
            >
              {d.amount > 0 ? formatEUR(d.amount) : ""}
            </text>
            <text
              x={x + barWidth / 2}
              y={height - paddingBottom + 16}
              textAnchor="middle"
              fontSize={10}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
