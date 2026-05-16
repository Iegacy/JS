import { useMemo, useState } from 'react';
import type { KospiDataPoint } from '../data/kospiData';

interface PriceChartProps {
  data: KospiDataPoint[];
  predictions?: { date: string; price: number }[];
}

export default function PriceChart({ data, predictions }: PriceChartProps) {
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('3M');
  
  const filteredData = useMemo(() => {
    const days = { '1M': 22, '3M': 66, '6M': 132, '1Y': 252, 'ALL': data.length }[range];
    return data.slice(-days);
  }, [data, range]);

  const chartData = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const prices = filteredData.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.98;
    const maxPrice = Math.max(...prices) * 1.02;
    const priceRange = maxPrice - minPrice;
    
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 60, bottom: 30, left: 0 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    
    const points = filteredData.map((d, i) => ({
      x: padding.left + (i / (filteredData.length - 1)) * chartW,
      y: padding.top + chartH - ((d.close - minPrice) / priceRange) * chartH,
      price: d.close,
      date: `${d.date.slice(0, 4)}-${d.date.slice(4, 6)}-${d.date.slice(6, 8)}`
    }));
    
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = path + ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;
    
    // Price labels
    const priceLabels = [];
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
      const price = minPrice + (priceRange * i) / numLabels;
      const y = padding.top + chartH - (i / numLabels) * chartH;
      priceLabels.push({ y, label: Math.round(price).toLocaleString() });
    }
    
    // Prediction points
    let predPoints: { x: number; y: number; price: number; date: string }[] = [];
    if (predictions && predictions.length > 0) {
      const lastX = points[points.length - 1].x;
      const xStep = chartW * 0.15 / predictions.length;
      predPoints = predictions.map((p, i) => ({
        x: lastX + (i + 1) * xStep,
        y: padding.top + chartH - ((p.price - minPrice) / priceRange) * chartH,
        price: p.price,
        date: p.date
      }));
    }
    
    const isUp = filteredData[filteredData.length - 1].close >= filteredData[0].close;
    
    return { points, path, areaPath, priceLabels, predPoints, width, height, isUp, padding };
  }, [filteredData, predictions]);

  if (!chartData) return null;

  const gradientId = chartData.isUp ? 'chartGradientUp' : 'chartGradientDown';
  const lineColor = chartData.isUp ? '#22c55e' : '#ef4444';

  return (
    <div className="w-full">
      {/* Range selector */}
      <div className="flex gap-1 mb-4">
        {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              range === r
                ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {chartData.priceLabels.map((pl, i) => (
            <g key={i}>
              <line
                x1={chartData.padding.left}
                y1={pl.y}
                x2={chartData.width - chartData.padding.right}
                y2={pl.y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={chartData.width - chartData.padding.right + 8}
                y={pl.y + 4}
                fill="rgba(255,255,255,0.3)"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {pl.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path d={chartData.areaPath} fill={`url(#${gradientId})`} />
          
          {/* Price line */}
          <path d={chartData.path} fill="none" stroke={lineColor} strokeWidth="2" />

          {/* Prediction line */}
          {chartData.predPoints.length > 0 && (
            <>
              <path
                d={`M ${chartData.points[chartData.points.length - 1].x} ${chartData.points[chartData.points.length - 1].y} ${chartData.predPoints.map(p => `L ${p.x} ${p.y}`).join(' ')}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.8"
              />
              {chartData.predPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" stroke="#1e1b4b" strokeWidth="2" />
              ))}
            </>
          )}

          {/* Current price dot */}
          <circle
            cx={chartData.points[chartData.points.length - 1].x}
            cy={chartData.points[chartData.points.length - 1].y}
            r="5"
            fill={lineColor}
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
          />
          <circle
            cx={chartData.points[chartData.points.length - 1].x}
            cy={chartData.points[chartData.points.length - 1].y}
            r="8"
            fill={lineColor}
            opacity="0.3"
          />
        </svg>
      </div>
    </div>
  );
}
