import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';
import { fetchQuote } from '../_shared/yahoo.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: 'not signed in' }, 401);

    const { seasonId, areaKey, symbol } = await req.json();
    if (!seasonId || !areaKey || !symbol) return json({ error: 'missing fields' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const today = new Date().toISOString().slice(0, 10);
    const { data: season } = await admin.from('seasons').select('*').eq('id', seasonId).single();
    if (!season || season.starts_at > today || season.ends_at < today) {
      return json({ error: 'season is not active' }, 400);
    }

    const quote = await fetchQuote(symbol);

    const { data: pick, error } = await admin.from('picks').insert({
      season_id: seasonId,
      player_id: user.id,
      area_key: areaKey,
      symbol: quote.symbol,
      name: quote.name,
      currency: quote.currency,
      locked_price: quote.price,
    }).select().single();
    if (error) {
      const message = error.code === '23505' ? 'this area is already locked in' : error.message;
      return json({ error: message }, 400);
    }

    await admin.from('prices').upsert({
      symbol: quote.symbol, price: quote.price, currency: quote.currency,
      fetched_at: new Date().toISOString(),
    });

    return json({ pick });
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
