// Top Korean stocks - embedded list for offline search
export interface StockInfo {
  code: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ';
}

export const POPULAR_STOCKS: StockInfo[] = [
  { code: '005930', name: '삼성전자', market: 'KOSPI' },
  { code: '000660', name: 'SK하이닉스', market: 'KOSPI' },
  { code: '005380', name: '현대차', market: 'KOSPI' },
  { code: '005490', name: 'POSCO홀딩스', market: 'KOSPI' },
  { code: '035420', name: 'NAVER', market: 'KOSPI' },
  { code: '035720', name: '카카오', market: 'KOSPI' },
  { code: '051910', name: 'LG화학', market: 'KOSPI' },
  { code: '006400', name: '삼성SDI', market: 'KOSPI' },
  { code: '068270', name: '셀트리온', market: 'KOSPI' },
  { code: '055550', name: '신한지주', market: 'KOSPI' },
  { code: '105560', name: 'KB금융', market: 'KOSPI' },
  { code: '003670', name: '포스코퓨처엠', market: 'KOSPI' },
  { code: '012330', name: '현대모비스', market: 'KOSPI' },
  { code: '066570', name: 'LG전자', market: 'KOSPI' },
  { code: '028260', name: '삼성물산', market: 'KOSPI' },
  { code: '003550', name: 'LG', market: 'KOSPI' },
  { code: '034730', name: 'SK', market: 'KOSPI' },
  { code: '032830', name: '삼성생명', market: 'KOSPI' },
  { code: '015760', name: '한국전력', market: 'KOSPI' },
  { code: '009150', name: '삼성전기', market: 'KOSPI' },
  { code: '030200', name: 'KT', market: 'KOSPI' },
  { code: '017670', name: 'SK텔레콤', market: 'KOSPI' },
  { code: '316140', name: '우리금융지주', market: 'KOSPI' },
  { code: '086790', name: '하나금융지주', market: 'KOSPI' },
  { code: '000270', name: '기아', market: 'KOSPI' },
  { code: '033780', name: 'KT&G', market: 'KOSPI' },
  { code: '096770', name: 'SK이노베이션', market: 'KOSPI' },
  { code: '010950', name: 'S-Oil', market: 'KOSPI' },
  { code: '018260', name: '삼성에스디에스', market: 'KOSPI' },
  { code: '036570', name: '엔씨소프트', market: 'KOSPI' },
  { code: '011200', name: 'HMM', market: 'KOSPI' },
  { code: '034020', name: '두산에너빌리티', market: 'KOSPI' },
  { code: '000810', name: '삼성화재', market: 'KOSPI' },
  { code: '024110', name: '기업은행', market: 'KOSPI' },
  { code: '010130', name: '고려아연', market: 'KOSPI' },
  { code: '373220', name: 'LG에너지솔루션', market: 'KOSPI' },
  { code: '247540', name: '에코프로비엠', market: 'KOSPI' },
  { code: '352820', name: '하이브', market: 'KOSPI' },
  { code: '003490', name: '대한항공', market: 'KOSPI' },
  { code: '009540', name: '한국조선해양', market: 'KOSPI' },
  { code: '267250', name: '현대중공업', market: 'KOSPI' },
  { code: '042700', name: '한미반도체', market: 'KOSPI' },
  { code: '010140', name: '삼성중공업', market: 'KOSPI' },
  { code: '329180', name: 'HD현대중공업', market: 'KOSPI' },
  { code: '402340', name: 'SK스퀘어', market: 'KOSPI' },
  { code: '207940', name: '삼성바이오로직스', market: 'KOSPI' },
  { code: '259960', name: '크래프톤', market: 'KOSPI' },
  { code: '138930', name: 'BNK금융지주', market: 'KOSPI' },
  { code: '377300', name: '카카오페이', market: 'KOSPI' },
  { code: '323410', name: '카카오뱅크', market: 'KOSPI' },
  // KOSDAQ
  { code: '247540', name: '에코프로비엠', market: 'KOSDAQ' },
  { code: '091990', name: '셀트리온헬스케어', market: 'KOSDAQ' },
  { code: '086520', name: '에코프로', market: 'KOSDAQ' },
  { code: '196170', name: '알테오젠', market: 'KOSDAQ' },
  { code: '263750', name: '펄어비스', market: 'KOSDAQ' },
  { code: '293490', name: '카카오게임즈', market: 'KOSDAQ' },
  { code: '403870', name: 'HPSP', market: 'KOSDAQ' },
  { code: '041510', name: 'SM', market: 'KOSDAQ' },
  { code: '112040', name: '위메이드', market: 'KOSDAQ' },
  { code: '145020', name: '휴젤', market: 'KOSDAQ' },
];

export function searchStocks(query: string): StockInfo[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  // Search by code or name
  return POPULAR_STOCKS.filter(s =>
    s.code.includes(q) || s.name.toLowerCase().includes(q)
  ).slice(0, 10);
}

// 종목코드인지 확인 (6자리 숫자)
export function isStockCode(input: string): boolean {
  return /^\d{6}$/.test(input.trim());
}
