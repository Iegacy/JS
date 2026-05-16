const models = [
  {
    id: 'arima',
    name: 'ARIMA(2,1,1)',
    icon: '📐',
    color: '#6366f1',
    desc: 'Box-Jenkins 방법론의 자기회귀 누적 이동평균 모델. 차분으로 정상성을 확보하고 AR+MA 계수로 예측합니다.',
    ref: 'Box & Jenkins (1970)',
    how: '시계열 데이터를 1차 차분하여 정상성을 확보한 뒤, 과거 2개 시점의 자기회귀(AR)와 1개 시점의 이동평균(MA) 오차항을 이용하여 미래 가격을 예측합니다. Yule-Walker 방정식으로 계수를 추정합니다.'
  },
  {
    id: 'taw',
    name: 'Temporal Attention (TAW)',
    icon: '🔍',
    color: '#8b5cf6',
    desc: 'Transformer Self-Attention 메커니즘을 적용하여 시계열의 중요한 과거 패턴에 동적 가중치를 부여합니다.',
    ref: 'Vaswani et al. (2017) + 금융 적용 (2024)',
    how: '최근 가격 패턴을 Query로 하여 과거 시계열 전체에서 유사 패턴을 검색합니다. 코사인 유사도 기반 Attention Score로 가중치를 계산하고, 유사 패턴 이후의 가격 변동을 가중 평균하여 예측합니다.'
  },
  {
    id: 'mswd',
    name: 'Wavelet Decomposition (MSWD)',
    icon: '🌊',
    color: '#a855f7',
    desc: '웨이블릿 변환으로 가격을 다중 스케일로 분해하여 단기 노이즈와 장기 트렌드를 분리 분석합니다.',
    ref: 'TF-ViTNet (2024), N-BEATS Hybrid',
    how: 'Haar 웨이블릿으로 가격 신호를 4단계로 분해합니다. 저주파 근사(Approximation)에서 장기 추세를, 고주파 상세(Detail)에서 단기 노이즈와 주기를 분석하여 다중 스케일 예측을 합성합니다.'
  },
  {
    id: 'ard',
    name: 'Regime Detection (ARD)',
    icon: '🔄',
    color: '#ec4899',
    desc: 'Hidden Markov Model 기반으로 시장 레짐(상승/하락/횡보/고변동성)을 감지하고 레짐별 전략을 적용합니다.',
    ref: 'Hamilton (1989) + ML 개선 (2024)',
    how: '최근 20일 수익률의 평균과 변동성을 분석하여 4가지 시장 레짐(상승장/하락장/횡보장/고변동성)을 분류합니다. 레짐별 기대수익률과 전이확률을 적용하여 예측합니다.'
  },
  {
    id: 'dls',
    name: 'Dual-Path LSTM (DLS)',
    icon: '🧬',
    color: '#f59e0b',
    desc: '가격 시퀀스와 기술적 지표를 분리된 LSTM 경로로 처리하여 융합하는 HDA-LSTM 영감 모델입니다.',
    ref: 'HDA-LSTM (2025), BiLSTM-Attention',
    how: '경로 1: EMA/SMA 기반 가격 모멘텀을 분석합니다. 경로 2: RSI, MACD, 볼린저밴드, 거래량 등 기술적 지표를 분석합니다. 두 경로를 Attention 기반 가중치(60:40)로 융합합니다.'
  },
  {
    id: 'moe',
    name: 'Mixture of Experts (MoE)',
    icon: '👥',
    color: '#10b981',
    desc: 'LAMFormer 영감의 다중 전문가 시스템으로, 시장 상황에 따라 최적의 예측 전문가를 동적 선택합니다.',
    ref: 'LAMFormer (2025), MoE-Transformer',
    how: '4개의 전문가(추세추종/평균회귀/모멘텀/변동성돌파)가 독립적으로 예측합니다. 게이팅 네트워크가 RSI, 변동성 수준 등 시장 상태를 분석하여 전문가별 가중치를 동적으로 결정합니다.'
  },
  {
    id: 'ppmc',
    name: 'Monte Carlo (PPMC)',
    icon: '🎲',
    color: '#ef4444',
    desc: 'Geometric Brownian Motion과 Jump Diffusion을 결합한 확률적 시뮬레이션으로 가격 경로를 예측합니다.',
    ref: 'Merton (1976) + Jump Diffusion 개선',
    how: '1,000회 시뮬레이션을 수행합니다. 각 경로에서 GBM(기하 브라운 운동)으로 일상적 변동을, Jump Diffusion으로 급격한 가격 변동을 모델링합니다. 중앙값과 5-95% 신뢰구간을 제공합니다.'
  },
  {
    id: 'camvs',
    name: 'Volatility Scaled (CAMVS)',
    icon: '📏',
    color: '#f97316',
    desc: '리스크 패리티와 변동성 타겟팅을 결합하여 변동성에 따라 포지션 크기를 동적으로 조절합니다.',
    ref: 'Risk Parity (2024), Vol Targeting',
    how: '단기(10일)와 장기(60일) 변동성을 비교하여 변동성 레짐을 판단합니다. 목표 변동성(15%)에 맞춰 역변동성 포지션 사이징을 적용하고, 추세 신호와 결합하여 예측합니다.'
  },
  {
    id: 'aeml',
    name: 'Adaptive Ensemble (AEML)',
    icon: '🏗️',
    color: '#06b6d4',
    desc: 'Stacking Ensemble과 온라인 학습을 결합하여 최근 예측 성능에 따라 가중치를 동적으로 조정합니다.',
    ref: 'Stacking (2025), Meta-Learning',
    how: '메타 러너가 다른 모든 모델의 예측을 입력으로 받습니다. 각 모델의 신뢰도와 예측 합의도(평균과의 거리)를 기반으로 가중치를 산출하고, 합의 기반 보정을 추가하여 최종 앙상블 예측을 생성합니다.'
  },
  {
    id: 'fmh',
    name: 'Fractal Market (FMH)',
    icon: '🔮',
    color: '#84cc16',
    desc: '프랙탈 시장 가설 기반으로 Hurst 지수를 추정하여 추세 지속성/반전을 예측합니다.',
    ref: 'Mandelbrot (1997), R/S Analysis',
    how: 'R/S 분석(Range/Standard deviation)으로 Hurst 지수를 추정합니다. H>0.5이면 추세 지속형(최근 방향 유지), H<0.5이면 평균 회귀형(반전)으로 판단하여 멱법칙 스케일링으로 예측합니다.'
  },
  {
    id: 'vmd-mf-gru',
    name: 'VMD-MF-GRU',
    icon: '🧠',
    color: '#14b8a6',
    desc: 'VMD(변분 모드 분해)로 가격을 IMF로 분리하고, 다중프랙탈 스펙트럼 폭으로 GRU 게이팅 가중치를 동적 조정합니다.',
    ref: 'MDPI Fractal Fract. (2026년 3월) — VMD-MF-GRU',
    how: '2026년 최신 논문. ① VMD로 가격 시계열을 3개의 고유 모드 함수(IMF)로 분해합니다(저주파 추세, 중주파 주기, 고주파 노이즈). ② 각 IMF에 대해 다중프랙탈 R/S 분석으로 스펙트럼 폭(Δα)을 계산합니다. ③ 스펙트럼 폭을 시그모이드 활성화하여 GRU의 업데이트 게이트 가중치 행렬을 동적으로 조정합니다. ④ 각 IMF별 예측값을 합산하여 최종 가격을 재구성합니다. 비정상 시계열의 급변 패턴 포착에 강점이 있습니다.'
  }
];

export default function MethodologyInfo() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">🧪 예측 방법론 가이드</h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Roh G.H. Quant는 11개의 독립적인 가격 예측 모델을 병렬 실행하고 적응적 앙상블로 결합합니다.
          각 모델은 서로 다른 시장 이론과 수학적 프레임워크에 기반합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{model.icon}</span>
              <span className="text-sm font-bold text-white">{model.name}</span>
              <div
                className="ml-auto w-2 h-2 rounded-full"
                style={{ backgroundColor: model.color }}
              />
            </div>
            <p className="text-xs text-slate-400 mb-2">{model.desc}</p>
            <div className="bg-white/[0.03] rounded-lg p-2.5 mb-2">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                <span className="text-indigo-400 font-medium">작동 원리:</span> {model.how}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-600">📄</span>
              <span className="text-[10px] text-slate-500 italic">{model.ref}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
