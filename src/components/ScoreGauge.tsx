import { useMemo } from 'react';

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  label?: string;
}

export default function ScoreGauge({ score, size = 160, label }: ScoreGaugeProps) {
  const { color, bgColor, emoji, text } = useMemo(() => {
    if (score >= 80) return { color: '#22c55e', bgColor: 'rgba(34,197,94,0.12)', emoji: '🚀', text: '강력 매수' };
    if (score >= 60) return { color: '#84cc16', bgColor: 'rgba(132,204,22,0.12)', emoji: '📈', text: '매수 우세' };
    if (score >= 40) return { color: '#eab308', bgColor: 'rgba(234,179,8,0.12)', emoji: '⚖️', text: '중립' };
    if (score >= 20) return { color: '#f97316', bgColor: 'rgba(249,115,22,0.12)', emoji: '📉', text: '매도 우세' };
    return { color: '#ef4444', bgColor: 'rgba(239,68,68,0.12)', emoji: '🔻', text: '강력 매도' };
  }, [score]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const arc = circumference * 0.75; // 270 degrees
  const offset = arc - (arc * score) / 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={10}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135, ${size / 2}, ${size / 2})`}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(135, ${size / 2}, ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          {/* Glow effect */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeDasharray={`${arc} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(135, ${size / 2}, ${size / 2})`}
            opacity={0.3}
            filter="blur(4px)"
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl">{emoji}</span>
          <span className="text-3xl font-bold mt-1" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-slate-400 mt-0.5">/100</span>
        </div>
      </div>
      {label && (
        <div className="text-center mt-1">
          <div className="text-sm font-semibold" style={{ color }}>{text}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      )}
      <div 
        className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: bgColor, color }}
      >
        종합 점수
      </div>
    </div>
  );
}
