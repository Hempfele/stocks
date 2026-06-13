import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { fetchQuote } from '../_shared/yahoo.ts';

const STALE_MINUTES = 30;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const today = new Date().toISOString().slice(0, 10);
    const { data: seasons } = await admin.from('seasons')
      .select('id').lte('starts_at', today).gte('ends_at', today);
    if (!seasons?.length) return json({ refreshed: 0 });

    const { data: picks } = await admin.from('picks')
      .select('symbol').in('season_id', seasons.map((s) => s.id));
    const symbols = [...new Set((picks ?? []).map((p) => p.symbol))];

    const { data: cached } = await admin.from('prices').select('symbol, fetched_at');
    const staleBefore = Date.now() - STALE_MINUTES * 60 * 1000;
    const fresh = new Set(
      (cached ?? [])
        .filter((c) => new Date(c.fetched_at).getTime() > staleBefore)
        .map((c) => c.symbol),
    );
    const toFetch = symbols.filter((s) => !fresh.has(s));

    let refreshed = 0;
    for (const symbol of toFetch) {
      try {
        const quote = await fetchQuote(symbol);
        await admin.from('prices').upsert({
          symbol: quote.symbol, price: quote.price, currency: quote.currency,
          fetched_at: new Date().toISOString(),
        });
        await admin.from('price_snapshots').upsert({ symbol: quote.symbol, price: quote.price });
        refreshed++;
      } catch (e) {
        console.warn(`refresh failed for ${symbol}:`, (e as Error).message);
      }
    }
    return json({ refreshed, total: symbols.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
