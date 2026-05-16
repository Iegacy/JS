import { useState, useRef, useEffect, useCallback } from 'react';
import { searchStocks, isStockCode, POPULAR_STOCKS, type StockInfo } from '../data/stockList';

interface StockSearchProps {
  onSelect: (stock: StockInfo) => void;
  currentStock: StockInfo | null;
  isLoading: boolean;
}

export default function StockSearch({ onSelect, currentStock, isLoading }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockInfo[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      setResults(searchStocks(query));
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowPopular(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((stock: StockInfo) => {
    setQuery('');
    setShowDropdown(false);
    setShowPopular(false);
    onSelect(stock);
  }, [onSelect]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // Direct code entry
    if (isStockCode(q)) {
      const found = POPULAR_STOCKS.find(s => s.code === q);
      if (found) {
        handleSelect(found);
      } else {
        // Unknown code — try anyway
        handleSelect({ code: q, name: q, market: 'KOSPI' });
      }
      return;
    }

    // First matching result
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  }, [query, results, handleSelect]);

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length > 0) setShowDropdown(true);
              else setShowPopular(true);
            }}
            placeholder="종목명 또는 코드 검색 (예: 삼성전자, 005930)"
            disabled={isLoading}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/30 disabled:opacity-50 transition-all"
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          검색
        </button>
      </form>

      {/* Current stock badge */}
      {currentStock && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-600">현재 분석 중:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400">
            <span className="text-[10px] text-indigo-600 font-mono">{currentStock.code}</span>
            <span>{currentStock.name}</span>
            <span className="text-[10px] text-slate-600">{currentStock.market}</span>
          </span>
        </div>
      )}

      {/* Search results dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-64 overflow-y-auto" style={{ zIndex: 9999 }}>
          {results.map(stock => (
            <button
              key={stock.code}
              onClick={() => handleSelect(stock)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <span className="text-xs font-mono text-slate-500 w-16">{stock.code}</span>
              <span className="text-sm text-white flex-1">{stock.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${stock.market === 'KOSPI' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                {stock.market}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {showDropdown && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4" style={{ zIndex: 9999 }}>
          <p className="text-xs text-slate-500 text-center">
            {isStockCode(query.trim())
              ? `종목코드 "${query.trim()}"로 직접 검색합니다. Enter 키를 누르세요.`
              : '검색 결과가 없습니다. 종목코드 6자리를 직접 입력해 볼 수도 있습니다.'}
          </p>
        </div>
      )}

      {/* Popular stocks (shown on focus with empty query) */}
      {showPopular && !showDropdown && (
        <div className="absolute top-full mt-1 w-full bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden max-h-80 overflow-y-auto" style={{ zIndex: 9999 }}>
          <div className="px-4 py-2 border-b border-white/5">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">인기 종목</span>
          </div>
          {POPULAR_STOCKS.slice(0, 15).map(stock => (
            <button
              key={stock.code + stock.market}
              onClick={() => handleSelect(stock)}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.06] transition-colors text-left"
            >
              <span className="text-xs font-mono text-slate-500 w-16">{stock.code}</span>
              <span className="text-sm text-white flex-1">{stock.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${stock.market === 'KOSPI' ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                {stock.market}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
