const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

export interface Quote {
  symbol: string;
  price: number;
  currency: string;
  name: string;
}

export async function fetchQuote(symbol: string): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`quote fetch failed for ${symbol}: ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta?.regularMarketPrice) throw new Error(`no price for ${symbol}`);
  return {
    symbol,
    price: meta.regularMarketPrice,
    currency: meta.currency ?? 'USD',
    name: meta.longName ?? meta.shortName ?? symbol,
  };
}

export async function searchStocks(q: string) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`search failed: ${res.status}`);
  const data = await res.json();
  return (data.quotes ?? [])
    .filter((x: { quoteType?: string }) => x.quoteType === 'EQUITY' || x.quoteType === 'ETF')
    .map((x: { symbol: string; shortname?: string; longname?: string; exchDisp?: string }) => ({
      symbol: x.symbol,
      name: x.shortname ?? x.longname ?? x.symbol,
      exchange: x.exchDisp ?? '',
    }));
}
