// Data layer. Two backends behind one API:
//  - supabase: real auth, storage, and edge functions (when js/config.js is filled in)
//  - demo: in-memory fake data so the game runs locally with zero setup
import { config, isDemo } from './config.js';
import { AREAS } from './areas.js';

// ---------------------------------------------------------------- demo backend

const CATALOG = [
  { symbol: 'NESN.SW', name: 'Nestlé', exchange: 'SWX', base: 92 },
  { symbol: 'KO', name: 'Coca-Cola', exchange: 'NYSE', base: 63 },
  { symbol: 'OATLY', name: 'Oatly Group', exchange: 'NASDAQ', base: 1.2 },
  { symbol: 'HD', name: 'Home Depot', exchange: 'NYSE', base: 345 },
  { symbol: 'VNA.DE', name: 'Vonovia', exchange: 'XETRA', base: 28 },
  { symbol: 'NOVO-B.CO', name: 'Novo Nordisk', exchange: 'CPH', base: 620 },
  { symbol: 'FME.DE', name: 'Fresenius Medical Care', exchange: 'XETRA', base: 38 },
  { symbol: 'VWS.CO', name: 'Vestas Wind Systems', exchange: 'CPH', base: 160 },
  { symbol: 'IBE.MC', name: 'Iberdrola', exchange: 'BME', base: 12 },
  { symbol: 'ENPH', name: 'Enphase Energy', exchange: 'NASDAQ', base: 110 },
  { symbol: 'ALV.DE', name: 'Allianz', exchange: 'XETRA', base: 260 },
  { symbol: 'MUV2.DE', name: 'Munich Re', exchange: 'XETRA', base: 430 },
  { symbol: 'SMNNY', name: 'Shimano', exchange: 'OTC', base: 18 },
  { symbol: 'TSLA', name: 'Tesla', exchange: 'NASDAQ', base: 250 },
  { symbol: 'RACE', name: 'Ferrari', exchange: 'NYSE', base: 410 },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom', exchange: 'XETRA', base: 23 },
  { symbol: 'AAPL', name: 'Apple', exchange: 'NASDAQ', base: 215 },
  { symbol: 'NTDOY', name: 'Nintendo', exchange: 'OTC', base: 14 },
  { symbol: 'DIS', name: 'Walt Disney', exchange: 'NYSE', base: 105 },
  { symbol: 'SPOT', name: 'Spotify', exchange: 'NYSE', base: 310 },
  { symbol: 'DUOL', name: 'Duolingo', exchange: 'NASDAQ', base: 230 },
  { symbol: 'ASML', name: 'ASML Holding', exchange: 'AMS', base: 870 },
  { symbol: 'SAP.DE', name: 'SAP', exchange: 'XETRA', base: 190 },
  { symbol: 'RKLB', name: 'Rocket Lab', exchange: 'NASDAQ', base: 7 },
  { symbol: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ', base: 120 },
  { symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', base: 430 },
  { symbol: 'NKE', name: 'Nike', exchange: 'NYSE', base: 92 },
  { symbol: 'SBUX', name: 'Starbucks', exchange: 'NASDAQ', base: 88 },
  { symbol: 'ABNB', name: 'Airbnb', exchange: 'NASDAQ', base: 145 },
  { symbol: 'BKNG', name: 'Booking Holdings', exchange: 'NASDAQ', base: 3900 },
];

const HEMPF_PICKS = {
  nourishment: 'NESN.SW', home: 'HD', health: 'NOVO-B.CO', energy: 'VWS.CO',
  safety: 'ALV.DE', mobility: 'SMNNY', connection: 'DTE.DE', play: 'NTDOY',
  growth: 'DUOL', dreams: 'RKLB',
};

const DAY = 86400000;
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7);

// Deterministic smooth fake price so the demo dashboard moves between days.
function demoPriceAt(symbol, date) {
  const entry = CATALOG.find((c) => c.symbol === symbol);
  const base = entry ? entry.base : 100;
  const d = Math.floor(date.getTime() / DAY);
  const h = hash(symbol);
  const wave = 0.12 * Math.sin(h + d / 9) + 0.05 * Math.sin(h * 2 + d / 3);
  return Math.round(base * (1 + wave) * 100) / 100;
}

function createDemoStore() {
  const today = new Date();
  const season = {
    id: 'demo-season',
    name: 'Season 1 (demo)',
    starts_at: new Date(today.getTime() - 30 * DAY).toISOString().slice(0, 10),
    ends_at: new Date(today.getTime() + 60 * DAY).toISOString().slice(0, 10),
  };
  const seasonStart = new Date(season.starts_at);

  const saved = JSON.parse(localStorage.getItem('fp-demo') || '{}');
  const state = {
    signedIn: saved.signedIn || false,
    name: saved.name || null,
    picks: saved.picks || [],
  };
  const persist = () => localStorage.setItem('fp-demo', JSON.stringify(state));

  // Dev helper: ?seed signs in with a pre-filled board, ?reset clears demo state.
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) { localStorage.removeItem('fp-demo'); Object.assign(state, { signedIn: false, name: null, picks: [] }); }
  if (params.has('seed')) {
    const seedPicks = {
      nourishment: 'SBUX', home: 'ABNB', health: 'NKE', energy: 'ENPH',
      safety: 'MUV2.DE', mobility: 'TSLA', connection: 'AAPL', play: 'DIS',
    };
    state.signedIn = true;
    state.name = 'Bernd';
    state.picks = Object.entries(seedPicks).map(([areaKey, symbol]) => {
      const c = CATALOG.find((x) => x.symbol === symbol);
      return {
        player_id: 'demo-me', area_key: areaKey, symbol, name: c.name,
        currency: 'EUR', locked_price: demoPriceAt(symbol, seasonStart),
        locked_at: season.starts_at,
      };
    });
    persist();
  }

  const hempfPicks = Object.entries(HEMPF_PICKS).map(([areaKey, symbol]) => {
    const c = CATALOG.find((x) => x.symbol === symbol);
    return {
      player_id: 'demo-hempf', area_key: areaKey, symbol, name: c.name,
      currency: 'EUR', locked_price: demoPriceAt(symbol, seasonStart),
      locked_at: season.starts_at,
    };
  });

  return {
    demo: true,
    async getUser() { return state.signedIn ? { id: 'demo-me', email: 'you@demo' } : null; },
    async signIn() { state.signedIn = true; persist(); return { signedIn: true }; },
    async signOut() { state.signedIn = false; persist(); },
    async getMe() { return state.name ? { id: 'demo-me', display_name: state.name } : null; },
    async setName(name) { state.name = name; persist(); },
    async getActiveSeason() { return season; },
    async getPlayers() {
      const players = [{ id: 'demo-hempf', display_name: 'Hempf' }];
      if (state.name) players.unshift({ id: 'demo-me', display_name: state.name });
      return players;
    },
    async getPicks() { return [...state.picks, ...hempfPicks]; },
    async getPrices() {
      const symbols = new Set([...state.picks, ...hempfPicks].map((p) => p.symbol));
      return [...symbols].map((symbol) => ({
        symbol, price: demoPriceAt(symbol, today), fetched_at: today.toISOString(),
      }));
    },
    async searchStocks(q) {
      const needle = q.toLowerCase();
      return CATALOG
        .filter((c) => c.symbol.toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle))
        .slice(0, 8);
    },
    async makePick(seasonId, areaKey, stock) {
      // Demo locks at the season-start price so freshly picked stocks move right away.
      state.picks = state.picks.filter((p) => p.area_key !== areaKey);
      state.picks.push({
        player_id: 'demo-me', area_key: areaKey, symbol: stock.symbol, name: stock.name,
        currency: 'EUR', locked_price: demoPriceAt(stock.symbol, seasonStart),
        locked_at: new Date().toISOString(),
      });
      persist();
    },
    async refreshPrices() {},
  };
}

// ------------------------------------------------------------ supabase backend

async function createSupabaseStore() {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

  const invoke = async (fn, body) => {
    const { data, error } = await supabase.functions.invoke(fn, { body });
    if (error) throw new Error(`${fn}: ${error.message}`);
    return data;
  };
  const select = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    demo: false,
    onAuthChange(cb) { supabase.auth.onAuthStateChange(cb); },
    async getUser() {
      const { data } = await supabase.auth.getSession();
      return data.session?.user ?? null;
    },
    async signIn(email) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      });
      if (error) throw new Error(error.message);
      return { sentLink: true };
    },
    async signOut() { await supabase.auth.signOut(); },
    async getMe() {
      const user = await this.getUser();
      if (!user) return null;
      const rows = await select(supabase.from('players').select('*').eq('id', user.id));
      return rows[0] ?? null;
    },
    async setName(name) {
      const user = await this.getUser();
      const { error } = await supabase.from('players').upsert({ id: user.id, display_name: name });
      if (error) throw new Error(error.message);
    },
    async getActiveSeason() {
      const today = new Date().toISOString().slice(0, 10);
      const rows = await select(
        supabase.from('seasons').select('*')
          .lte('starts_at', today).gte('ends_at', today)
          .order('starts_at', { ascending: false }).limit(1),
      );
      return rows[0] ?? null;
    },
    async getPlayers() { return select(supabase.from('players').select('*').order('created_at')); },
    async getPicks(seasonId) { return select(supabase.from('picks').select('*').eq('season_id', seasonId)); },
    async getPrices() { return select(supabase.from('prices').select('*')); },
    async searchStocks(q) { return (await invoke('stock-search', { q })).results; },
    async makePick(seasonId, areaKey, stock) {
      return invoke('make-pick', { seasonId, areaKey, symbol: stock.symbol, name: stock.name });
    },
    async refreshPrices() {
      try { await invoke('refresh-prices', {}); } catch (e) { console.warn(e); }
    },
  };
}

export async function createStore() {
  return isDemo ? createDemoStore() : createSupabaseStore();
}
