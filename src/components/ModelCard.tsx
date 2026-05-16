import type { ModelPrediction } from '../models/predictionEngine';

interface ModelCardProps {
  model: ModelPrediction;
  currentPrice: number;
  expanded: boolean;
  onToggle: () => void;
}

export default function ModelCard({ model, currentPrice, expanded, onToggle }: ModelCardProps) {
  const signalConfig = {
    strong_buy: { label: '강력 매수', emoji: '🚀', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    buy: { label: '매수', emoji: '📈', bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
    neutral: { label: '중립', emoji: '⚖️', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    sell: { label: '매도', emoji: '📉', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
    strong_sell: { label: '강력 매도', emoji: '🔻', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  };

  const signal = signalConfig[model.signal];
  const isPositive = model.predictedChange >= 0;

  return (
    <div
      className={`rounded-xl border transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
        expanded ? 'bg-white/[0.06] border-white/10' : 'bg-white/[0.03] border-white/[0.06]'
      }`}
      onClick={onToggle}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: model.color }}
            />
            <span className="text-sm font-semibold text-white">{model.shortName}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${signal.bg} ${signal.text} border ${signal.border}`}>
            <span>{signal.emoji}</span>
            <span>{signal.label}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-white font-mono">
              {model.predictedPrice.toLocaleString()}
            </div>
            <div className={`text-sm font-semibold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{model.predictedChange.toFixed(2)}%
              <span className="text-xs text-slate-500 ml-1">
                ({isPositive ? '+' : ''}{(model.predictedPrice - currentPrice).toLocaleString()})
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">신뢰도</div>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${model.confidence}%`,
                    backgroundColor: model.confidence > 70 ? '#22c55e' : model.confidence > 50 ? '#eab308' : '#ef4444'
                  }}
                />
              </div>
              <span className="text-xs font-mono text-slate-400">{model.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <p className="text-xs text-slate-400 leading-relaxed">{model.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-600">📄</span>
            <span className="text-[10px] text-slate-500 italic">{model.reference}</span>
          </div>
          <div className="bg-white/[0.03] rounded-lg px-3 py-2">
            <span className="text-[10px] text-slate-500 font-mono">{model.details}</span>
          </div>
        </div>
      )}
    </div>
  );
}
