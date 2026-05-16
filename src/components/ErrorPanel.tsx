interface ErrorPanelProps {
  error: string;
  onRetry: () => void;
  isRetrying: boolean;
  symbol: string;
}

export default function ErrorPanel({ error, onRetry, isRetrying, symbol }: ErrorPanelProps) {
  return (
    <div className="bg-[#12121a]/80 backdrop-blur-sm rounded-2xl border border-red-500/20 p-8">
      <div className="max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4">🔌</div>
        <h2 className="text-lg font-bold text-white mb-2">데이터 연결 실패</h2>
        <p className="text-sm text-slate-400 mb-4">
          종목 <span className="text-indigo-400 font-mono font-medium">{symbol}</span>의 가격 데이터를 불러올 수 없습니다.
        </p>

        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-red-400/80 font-mono whitespace-pre-wrap leading-relaxed">
            {error}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>재시도 중...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>다시 시도</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-slate-600 font-medium">가능한 원인:</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• CORS 프록시 서버의 일시적 장애</li>
            <li>• 네이버 파이낸스 API의 접속 제한</li>
            <li>• 네트워크 연결 문제</li>
            <li>• 유효하지 않은 종목코드</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
