import type { KospiDataPoint } from '../data/kospiData';

interface MarketOverviewProps {
  data: KospiDataPoint[];
  dataSource: string;
  isLoading: boolean;
  connectionStatus: 'connected' | 'fallback' | 'loading';
  stockName?: string;
  stockCode?: string;
}

export default function MarketOverview({ data, dataSource, isLoading, connectionStatus, stockName, stockCode }: MarketOverviewProps) {
  if (data.length === 0) return null;
  
  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : latest;
  const change = latest.close - prev.close;
  const changePercent = (change / prev.close) * 100;
  const isPositive = change >= 0;

  // Calculate additional stats
  const week = data.slice(-5);
  const month = data.slice(-22);
  const weekChange = week.length > 0 ? ((latest.close - week[0].close) / week[0].close) * 100 : 0;
  const monthChange = month.length > 0 ? ((latest.close - month[0].close) / month[0].close) * 100 : 0;
  
  const high52 = Math.max(...data.slice(-252).map(d => d.high));
  const low52 = Math.min(...data.slice(-252).map(d => d.low));

  const formatDate = (d: string) => `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`;

  const statusConfig = {
    connected: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: '실시간 연결' },
    fallback: { color: 'text-amber-400', bg: 'bg-amber-500', label: '내장 데이터' },
    loading: { color: 'text-blue-400', bg: 'bg-blue-500', label: '연결 중...' },
  };
  const status = statusConfig[connectionStatus];

  return (
    <div className="space-y-4">
      {/* Connection status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.bg} ${connectionStatus === 'loading' ? 'animate-pulse' : ''}`} />
          <span className={`text-xs ${status.color}`}>{status.label}</span>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs text-slate-500">{dataSource}</span>
        </div>
        <span className="text-xs text-slate-500">{formatDate(latest.date)} 기준</span>
      </div>

      {/* Main Price */}
      <div className="flex items-end gap-4">
        <div>
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
            <span>🇰🇷</span> {stockName || 'KOSPI'} {stockCode ? <span className="font-mono text-slate-600">({stockCode})</span> : null}
          </div>
          {isLoading ? (
            <div className="h-12 w-48 bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <>
              <div className="text-5xl font-extrabold text-white font-mono tracking-tight">
                {latest.close.toLocaleString()}
              </div>
              <div className={`flex items-center gap-2 mt-1 text-lg font-semibold font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                <span>{isPositive ? '▲' : '▼'}</span>
                <span>{isPositive ? '+' : ''}{change.toLocaleString()}</span>
                <span className="text-base">({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { label: '시가', value: latest.open.toLocaleString(), icon: '📊' },
          { label: '고가', value: latest.high.toLocaleString(), icon: '⬆️' },
          { label: '저가', value: latest.low.toLocaleString(), icon: '⬇️' },
          { label: '거래량', value: `${(latest.volume / 1000000).toFixed(0)}M`, icon: '📦' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.04]">
            <div className="text-[10px] text-slate-600 mb-0.5 flex items-center gap-1">
              <span>{stat.icon}</span>{stat.label}
            </div>
            <div className="text-sm font-semibold text-white font-mono">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '주간 수익률', value: weekChange },
          { label: '월간 수익률', value: monthChange },
          { label: '52주 최고', value: high52, isPrice: true },
          { label: '52주 최저', value: low52, isPrice: true },
        ].map((item) => (
          <div key={item.label} className="bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.04]">
            <div className="text-[10px] text-slate-600 mb-0.5">{item.label}</div>
            {'isPrice' in item && item.isPrice ? (
              <div className="text-sm font-semibold text-white font-mono">{(item.value as number).toLocaleString()}</div>
            ) : (
              <div className={`text-sm font-semibold font-mono ${(item.value as number) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(item.value as number) >= 0 ? '+' : ''}{(item.value as number).toFixed(2)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
