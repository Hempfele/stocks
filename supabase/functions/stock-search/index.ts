import { corsHeaders, json } from '../_shared/cors.ts';
import { searchStocks } from '../_shared/yahoo.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { q } = await req.json();
    if (!q || q.trim().length < 2) return json({ results: [] });
    return json({ results: await searchStocks(q.trim()) });
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }
});
