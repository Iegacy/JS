import { useState } from 'react';
import type { TimeHorizonPrediction } from '../models/predictionEngine';
import ModelCard from './ModelCard';
import ScoreGauge from './ScoreGauge';

interface HorizonPanelProps {
  prediction: TimeHorizonPrediction;
  currentPrice: number;
  isActive: boolean;
}

export default function HorizonPanel({ prediction, currentPrice, isActive }: HorizonPanelProps) {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [showAllModels, setShowAllModels] = useState(false);

  if (!isActive) return null;

  const sortedModels = [...prediction.models].sort((a, b) => b.confidence - a.confidence);
  const displayModels = showAllModels ? sortedModels : sortedModels.slice(0, 5);

  const bullModels = prediction.models.filter(m => m.signal === 'buy' || m.signal === 'strong_buy').length;
  const bearModels = prediction.models.filter(m => m.signal === 'sell' || m.signal === 'strong_sell').length;
  const neutralModels = prediction.models.filter(m => m.signal === 'neutral').length;

  const ensembleChange = ((prediction.ensemblePrice - currentPrice) / currentPrice) * 100;
  const isPositive = ensembleChange >= 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="flex justify-center items-center">
          <ScoreGauge score={prediction.ensembleScore} label={prediction.horizon} />
        </div>

        {/* Ensemble Result */}
        <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06]">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <span>🎯</span> 앙상블 예측 가격
          </div>
          <div className="text-3xl font-bold text-white font-mono mb-1">
            {prediction.ensemblePrice.toLocaleString()}
          </div>
          <div className={`text-lg font-semibold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{ensembleChange.toFixed(2)}%
            <span className="text-sm text-slate-500 ml-2">
              ({isPositive ? '+' : ''}{(prediction.ensemblePrice - currentPrice).toLocaleString()})
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 leading-relaxed">
            {prediction.models.length}개 모델의 신뢰도 가중 평균으로 산출된 최종 예측 가격입니다.
          </div>
        </div>

        {/* Vote Distribution */}
        <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06]">
          <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
            <span>🗳️</span> 모델 투표 분포
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-400 w-8">매수</span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(bullModels / prediction.models.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-emerald-400 w-6 text-right">{bullModels}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-yellow-400 w-8">중립</span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(neutralModels / prediction.models.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-yellow-400 w-6 text-right">{neutralModels}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-red-400 w-8">매도</span>
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${(bearModels / prediction.models.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-red-400 w-6 text-right">{bearModels}</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 leading-relaxed">
            총 {prediction.models.length}개 모델 중 {bullModels}개가 상승, {bearModels}개가 하락을 예측합니다.
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <span>🧠</span> 개별 모델 예측 결과
          </h3>
          <button
            onClick={() => setShowAllModels(!showAllModels)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showAllModels ? '접기' : `전체 ${sortedModels.length}개 보기`}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayModels.map(model => (
            <ModelCard
              key={model.id}
              model={model}
              currentPrice={currentPrice}
              expanded={expandedModel === model.id}
              onToggle={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
