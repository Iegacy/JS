import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchStockData, type KospiDataPoint } from './data/kospiData';
import { runAllPredictions, type TimeHorizonPrediction } from './models/predictionEngine';
import type { StockInfo } from './data/stockList';
import PriceChart from './components/PriceChart';
import MarketOverview from './components/MarketOverview';
import HorizonPanel from './components/HorizonPanel';
import MethodologyInfo from './components/MethodologyInfo';
import ScoreGauge from './components/ScoreGauge';
import StockSearch from './components/StockSearch';
import ErrorPanel from './components/ErrorPanel';

type Tab = 'dashboard' | 'methodology';

export default function App() {
  const [data, setData] = useState<KospiDataPoint[]>([]);
  const [dataSource, setDataSource] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'fallback' | 'loading' | 'error'>('loading');
  const [activeHorizon, setActiveHorizon] = useState(0);
  const [predictions, setPredictions] = useState<TimeHorizonPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [currentStock, setCurrentStock] = useState<StockInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState('');

  // Fetch data for a specific stock
  const loadStockData = useCallback(async (stock: StockInfo) => {
    setIsLoading(true);
    setConnectionStatus('loading');
    setFetchError(null);
    setData([]);
    setPredictions([]);
    setCurrentStock(stock);

    try {
      const result = await fetchStockData(stock.code, (msg) => setProgressMsg(msg));

      if (result.success && result.data.length > 0) {
        setData(result.data);
        setDataSource(result.source);
        setConnectionStatus('connected');
        setFetchError(null);
      } else {
        setData([]);
        setDataSource('');
        setConnectionStatus('error');
        setFetchError(result.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      setData([]);
      setDataSource('');
      setConnectionStatus('error');
      setFetchError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }

    setIsLoading(false);
    setProgressMsg('');
  }, []);

  // Run predictions when data changes
  useEffect(() => {
    if (data.length > 30) {
      const results = runAllPredictions(data);
      setPredictions(results);
    } else {
      setPredictions([]);
    }
  }, [data]);

  const currentPrice = useMemo(() => {
    return data.length > 0 ? data[data.length - 1].close : 0;
  }, [data]);

  const horizonLabels = useMemo(() => [
    { label: '1일', days: 1, icon: '⚡' },
    { label: '3일', days: 3, icon: '📅' },
    { label: '7일', days: 7, icon: '📆' },
    { label: '30일', days: 30, icon: '📊' },
    { label: '60일', days: 60, icon: '📈' },
    { label: '120일', days: 120, icon: '🏔️' },
  ], []);

  const predictionPoints = useMemo(() => {
    if (predictions.length === 0) return [];
    return predictions.map(p => ({ date: `+${p.days}d`, price: p.ensemblePrice }));
  }, [predictions]);

  const handleRetry = useCallback(() => {
    if (currentStock) loadStockData(currentStock);
  }, [currentStock, loadStockData]);

  const handleStockSelect = useCallback((stock: StockInfo) => {
    loadStockData(stock);
  }, [loadStockData]);

  const hasData = data.length > 30;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#12121a] rounded-2xl border border-white/10 max-w-lg w-full p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg font-bold text-white">투자 유의사항</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-400 leading-relaxed">
              <p>본 서비스는 <span className="text-indigo-400 font-medium">교육 및 연구 목적</span>으로 제작되었으며, 제공되는 예측 결과는 투자 권유가 아닙니다.</p>
              <p>퀀트 모델의 예측은 과거 데이터 기반의 통계적 추정이며, 미래 수익을 보장하지 않습니다. 실제 투자 결정에 본 자료를 단독으로 활용하지 마십시오.</p>
              <p>모든 투자의 책임은 투자자 본인에게 있으며, 원금 손실의 위험이 있습니다.</p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="mt-5 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors"
            >
              이해했습니다
            </button>
          </div>
        </div>
      )}

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Roh G.H. Quant
                  </span>
                </h1>
                <p className="text-xs text-slate-500">한국 주식 시장 가격 예측 봇 · Multi-Model Ensemble</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]">
              {([
                { id: 'dashboard' as Tab, label: '대시보드', icon: '📊' },
                { id: 'methodology' as Tab, label: '방법론', icon: '🧪' },
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Stock Search — always visible, high z-index so dropdown overlays everything */}
        <section className="mb-6 relative" style={{ zIndex: 40 }}>
          <div className="bg-[#12121a] rounded-2xl border border-white/[0.06] p-5 overflow-visible">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>🔍</span> 종목 검색
              <span className="text-xs font-normal text-slate-600 ml-2">종목명 또는 6자리 코드로 검색하세요</span>
            </h2>
            <StockSearch
              onSelect={handleStockSelect}
              currentStock={currentStock}
              isLoading={isLoading}
            />
          </div>
        </section>

        {activeTab === 'dashboard' ? (
          <div className="relative" style={{ zIndex: 1 }}>
            {/* Loading state */}
            {isLoading && (
              <section className="mb-8">
                <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-16 text-center">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <div>
                      <span className="text-sm text-slate-300 block">데이터를 불러오는 중...</span>
                      {progressMsg && (
                        <span className="text-xs text-slate-500 block mt-1 font-mono">{progressMsg}</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Error state */}
            {!isLoading && connectionStatus === 'error' && fetchError && currentStock && (
              <section className="mb-8">
                <ErrorPanel
                  error={fetchError}
                  onRetry={handleRetry}
                  isRetrying={isLoading}
                  symbol={`${currentStock.name} (${currentStock.code})`}
                />
              </section>
            )}

            {/* Empty state — no stock selected yet */}
            {!isLoading && !hasData && connectionStatus !== 'error' && (
              <section className="mb-8">
                <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-16 text-center">
                  <div className="text-5xl mb-4">🇰🇷</div>
                  <h2 className="text-lg font-bold text-white mb-2">종목을 선택해 주세요</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    위 검색창에서 분석할 종목을 검색하세요. 종목명(예: 삼성전자) 또는 종목코드(예: 005930)로 검색할 수 있습니다.
                  </p>
                  <p className="text-xs text-slate-600 mt-3">
                    네이버 파이낸스 API에서 실시간 가격 데이터를 가져와 11개 퀀트 모델로 분석합니다.
                  </p>
                </div>
              </section>
            )}

            {/* Data loaded — show analysis */}
            {!isLoading && hasData && (
              <>
                {/* Market Overview */}
                <section className="mb-6">
                  <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
                    <MarketOverview
                      data={data}
                      dataSource={dataSource}
                      isLoading={false}
                      connectionStatus={connectionStatus === 'connected' ? 'connected' : 'fallback'}
                      stockName={currentStock?.name}
                      stockCode={currentStock?.code}
                    />
                  </div>
                </section>

                {/* Chart */}
                <section className="mb-6">
                  <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
                    <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <span>📉</span> 가격 추이 차트
                      {predictionPoints.length > 0 && (
                        <span className="text-xs text-indigo-400 font-normal ml-2">(점선 = 앙상블 예측 경로)</span>
                      )}
                    </h2>
                    <PriceChart data={data} predictions={predictionPoints} />
                  </div>
                </section>

                {/* Prediction Overview */}
                {predictions.length > 0 && (
                  <section className="mb-6">
                    <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
                      <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                        <span>🎯</span> 시계열별 종합 점수 개요
                      </h2>
                      <p className="text-xs text-slate-500 mb-6">
                        각 시계열에 대해 11개 모델의 예측을 종합한 점수입니다. 50점 이상은 상승, 50점 미만은 하락 편향을 의미합니다.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {predictions.map((pred, idx) => (
                          <button
                            key={pred.horizon}
                            onClick={() => setActiveHorizon(idx)}
                            className={`rounded-xl p-3 transition-all ${
                              activeHorizon === idx
                                ? 'bg-indigo-500/10 ring-1 ring-indigo-500/30'
                                : 'bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                          >
                            <ScoreGauge score={pred.ensembleScore} size={100} label={pred.horizon} />
                            <div className="mt-2 text-center">
                              <div className="text-xs font-mono text-white font-semibold">
                                {pred.ensemblePrice.toLocaleString()}
                              </div>
                              <div className={`text-[10px] font-mono ${
                                pred.ensemblePrice >= currentPrice ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {pred.ensemblePrice >= currentPrice ? '+' : ''}
                                {(((pred.ensemblePrice - currentPrice) / currentPrice) * 100).toFixed(2)}%
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Detailed Predictions */}
                {predictions.length > 0 && (
                  <section className="mb-6">
                    <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
                      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                        {horizonLabels.map((h, idx) => (
                          <button
                            key={h.days}
                            onClick={() => setActiveHorizon(idx)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                              activeHorizon === idx
                                ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                            }`}
                          >
                            <span>{h.icon}</span><span>{h.label}</span>
                          </button>
                        ))}
                      </div>
                      {predictions.map((pred, idx) => (
                        <HorizonPanel
                          key={pred.horizon}
                          prediction={pred}
                          currentPrice={currentPrice}
                          isActive={activeHorizon === idx}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          <section className="mb-8">
            <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
              <MethodologyInfo />
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 space-y-3">
          <div className="text-xs text-slate-600 max-w-2xl mx-auto leading-relaxed">
            <p className="mb-2">
              ⚠️ <span className="text-slate-500">면책 조항:</span> 본 시스템의 예측은 교육 및 연구 목적으로만 제공됩니다.
            </p>
            <p className="text-slate-700">
              데이터 출처: 네이버 파이낸스 API · 한국거래소(KRX) 검증 데이터
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-700">
            <span>Built with</span>
            <span className="text-indigo-500">React</span>+
            <span className="text-cyan-500">TypeScript</span>+
            <span className="text-blue-500">Tailwind CSS</span>
          </div>
          <p className="text-[10px] text-slate-800">© 2026 Roh G.H. Quant</p>
        </footer>
      </div>
    </div>
  );
}
