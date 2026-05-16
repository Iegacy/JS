export interface KospiDataPoint {
  date: string; // YYYYMMDD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FetchResult {
  success: boolean;
  data: KospiDataPoint[];
  source: string;
  error?: string;
}

// Primary APIs and their CORS proxy wrappers
const NAVER_CHART_ENDPOINTS = [
  // New mobile API (front-api v1)
  (symbol: string, start: string, end: string) =>
    `https://m.stock.naver.com/front-api/v1/external/chart/domestic/info?symbol=${symbol}&requestType=1&startTime=${start}&endTime=${end}&timeframe=day`,
  // Legacy siseJson API
  (symbol: string, start: string, end: string) =>
    `https://api.finance.naver.com/siseJson.naver?symbol=${symbol}&requestType=1&startTime=${start}&endTime=${end}&timeframe=day`,
];

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function parseNaverResponse(text: string): KospiDataPoint[] | null {
  const cleaned = text.trim();
  if (!cleaned.startsWith('[')) return null;

  try {
    // Try JSON parse first
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Naver returns JS-style array with single quotes sometimes
      const fn = new Function('return ' + cleaned);
      parsed = fn();
    }

    if (!Array.isArray(parsed) || parsed.length < 2) return null;

    const result: KospiDataPoint[] = [];
    for (let i = 1; i < parsed.length; i++) {
      const row = parsed[i];
      if (!Array.isArray(row) || row.length < 6) continue;
      const dateStr = String(row[0]).replace(/[" ]/g, '').trim();
      if (!/^\d{8}$/.test(dateStr)) continue;
      const o = Number(row[1]);
      const h = Number(row[2]);
      const l = Number(row[3]);
      const c = Number(row[4]);
      const v = Number(row[5]);
      if (isNaN(c) || c <= 0) continue;
      result.push({ date: dateStr, open: o, high: h, low: l, close: c, volume: v });
    }
    return result.length > 10 ? result : null;
  } catch {
    return null;
  }
}

/**
 * Fetch stock/index price data from Naver Finance.
 * Tries multiple endpoints × multiple CORS proxies.
 * Returns error on failure — no fake fallback data.
 */
export async function fetchStockData(
  symbol: string,
  onProgress?: (msg: string) => void
): Promise<FetchResult> {
  const today = new Date();
  const endDate = formatDateStr(today);
  const startDate = formatDateStr(new Date(today.getTime() - 600 * 24 * 60 * 60 * 1000)); // ~600 days back

  const errors: string[] = [];
  let attempt = 0;

  for (const makeEndpoint of NAVER_CHART_ENDPOINTS) {
    const rawUrl = makeEndpoint(symbol, startDate, endDate);
    for (const makeProxy of CORS_PROXIES) {
      attempt++;
      const proxyUrl = makeProxy(rawUrl);
      const proxyName = proxyUrl.includes('allorigins') ? 'AllOrigins'
        : proxyUrl.includes('corsproxy') ? 'CorsProxy'
        : 'CodeTabs';

      onProgress?.(`시도 ${attempt}/6: ${proxyName} 프록시로 연결 중...`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'text/plain, application/json, */*' }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          errors.push(`${proxyName}: HTTP ${response.status}`);
          continue;
        }

        const text = await response.text();
        const data = parseNaverResponse(text);

        if (data && data.length > 0) {
          return {
            success: true,
            data,
            source: `네이버 파이낸스 API (${proxyName} 프록시, ${data.length}일 데이터)`
          };
        } else {
          errors.push(`${proxyName}: 데이터 파싱 실패`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류';
        errors.push(`${proxyName}: ${msg.includes('abort') ? '타임아웃 (8초)' : msg}`);
      }
    }
  }

  return {
    success: false,
    data: [],
    source: '',
    error: `모든 연결 시도가 실패했습니다.\n${errors.map((e, i) => `  ${i + 1}. ${e}`).join('\n')}`
  };
}

function formatDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function getCurrentPrice(data: KospiDataPoint[]): number {
  return data.length > 0 ? data[data.length - 1].close : 0;
}

export function getLatestDate(data: KospiDataPoint[]): string {
  return data.length > 0 ? data[data.length - 1].date : '';
}
