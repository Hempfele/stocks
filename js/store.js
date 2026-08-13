// Data layer. Two backends behind one API:
//  - supabase: real auth, storage, and edge functions (when js/config.js is filled in)
//  - demo: in-memory fake data so the game runs locally with zero setup
import { config, isDemo } from './config.js';
import { AREAS } from './areas.js';

// ---------------------------------------------------------------- demo backend

const CATALOG = [
  // North America
  { symbol: 'AAPL', name: 'Apple', exchange: 'NASDAQ', base: 215, aliases: ['iphone', 'mac'] },
  { symbol: 'MSFT', name: 'Microsoft', exchange: 'NASDAQ', base: 430, aliases: ['windows', 'xbox', 'openai'] },
  { symbol: 'GOOGL', name: 'Alphabet', exchange: 'NASDAQ', base: 175, aliases: ['google', 'youtube', 'android'] },
  { symbol: 'AMZN', name: 'Amazon', exchange: 'NASDAQ', base: 185, aliases: ['aws', 'prime'] },
  { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', base: 505, aliases: ['facebook', 'instagram', 'whatsapp'] },
  { symbol: 'NVDA', name: 'NVIDIA', exchange: 'NASDAQ', base: 120, aliases: ['ai', 'gpu'] },
  { symbol: 'TSLA', name: 'Tesla', exchange: 'NASDAQ', base: 250, aliases: ['ev', 'electric car'] },
  { symbol: 'NFLX', name: 'Netflix', exchange: 'NASDAQ', base: 650 },
  { symbol: 'DIS', name: 'Walt Disney', exchange: 'NYSE', base: 105, aliases: ['disney', 'pixar', 'marvel'] },
  { symbol: 'SPOT', name: 'Spotify', exchange: 'NYSE', base: 310, aliases: ['music'] },
  { symbol: 'DUOL', name: 'Duolingo', exchange: 'NASDAQ', base: 230, aliases: ['language learning'] },
  { symbol: 'ABNB', name: 'Airbnb', exchange: 'NASDAQ', base: 145, aliases: ['travel'] },
  { symbol: 'BKNG', name: 'Booking Holdings', exchange: 'NASDAQ', base: 3900, aliases: ['booking.com'] },
  { symbol: 'NKE', name: 'Nike', exchange: 'NYSE', base: 92 },
  { symbol: 'SBUX', name: 'Starbucks', exchange: 'NASDAQ', base: 88, aliases: ['coffee'] },
  { symbol: 'MCD', name: "McDonald's", exchange: 'NYSE', base: 285 },
  { symbol: 'KO', name: 'Coca-Cola', exchange: 'NYSE', base: 63, aliases: ['coke'] },
  { symbol: 'PEP', name: 'PepsiCo', exchange: 'NASDAQ', base: 170, aliases: ['pepsi'] },
  { symbol: 'OATLY', name: 'Oatly Group', exchange: 'NASDAQ', base: 1.2, aliases: ['oat milk'] },
  { symbol: 'COST', name: 'Costco Wholesale', exchange: 'NASDAQ', base: 850 },
  { symbol: 'WMT', name: 'Walmart', exchange: 'NYSE', base: 70 },
  { symbol: 'HD', name: 'Home Depot', exchange: 'NYSE', base: 345 },
  { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', base: 165, aliases: ['p&g'] },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', base: 155 },
  { symbol: 'LLY', name: 'Eli Lilly', exchange: 'NYSE', base: 820 },
  { symbol: 'UNH', name: 'UnitedHealth Group', exchange: 'NYSE', base: 500 },
  { symbol: 'PFE', name: 'Pfizer', exchange: 'NYSE', base: 28 },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', base: 200 },
  { symbol: 'V', name: 'Visa', exchange: 'NYSE', base: 275 },
  { symbol: 'MA', name: 'Mastercard', exchange: 'NYSE', base: 470 },
  { symbol: 'PYPL', name: 'PayPal', exchange: 'NASDAQ', base: 65 },
  { symbol: 'SQ', name: 'Block', exchange: 'NYSE', base: 75, aliases: ['square', 'cash app'] },
  { symbol: 'XOM', name: 'Exxon Mobil', exchange: 'NYSE', base: 115 },
  { symbol: 'NEE', name: 'NextEra Energy', exchange: 'NYSE', base: 75 },
  { symbol: 'ENPH', name: 'Enphase Energy', exchange: 'NASDAQ', base: 110, aliases: ['solar'] },
  { symbol: 'FSLR', name: 'First Solar', exchange: 'NASDAQ', base: 260, aliases: ['solar'] },
  { symbol: 'CAT', name: 'Caterpillar', exchange: 'NYSE', base: 340 },
  { symbol: 'DE', name: 'Deere & Company', exchange: 'NYSE', base: 380, aliases: ['john deere'] },
  { symbol: 'BA', name: 'Boeing', exchange: 'NYSE', base: 180 },
  { symbol: 'RKLB', name: 'Rocket Lab', exchange: 'NASDAQ', base: 7, aliases: ['space'] },
  { symbol: 'PLTR', name: 'Palantir', exchange: 'NASDAQ', base: 25 },
  { symbol: 'SHOP.TO', name: 'Shopify', exchange: 'TSX', base: 90 },
  { symbol: 'RY.TO', name: 'Royal Bank of Canada', exchange: 'TSX', base: 140, aliases: ['rbc'] },
  { symbol: 'TD.TO', name: 'Toronto-Dominion Bank', exchange: 'TSX', base: 80, aliases: ['td bank'] },
  { symbol: 'MELI', name: 'MercadoLibre', exchange: 'NASDAQ', base: 1650, aliases: ['latin america ecommerce'] },

  // Japan
  { symbol: '7203.T', name: 'Toyota Motor', exchange: 'TYO', base: 3300, aliases: ['toyota'] },
  { symbol: '6758.T', name: 'Sony Group', exchange: 'TYO', base: 13500, aliases: ['playstation'] },
  { symbol: '7974.T', name: 'Nintendo', exchange: 'TYO', base: 8200 },
  { symbol: 'NTDOY', name: 'Nintendo', exchange: 'OTC', base: 14 },
  { symbol: '7453.T', name: 'Ryohin Keikaku', exchange: 'TYO', base: 2600, aliases: ['muji', '無印良品'] },
  { symbol: '9983.T', name: 'Fast Retailing', exchange: 'TYO', base: 41000, aliases: ['uniqlo'] },
  { symbol: '9984.T', name: 'SoftBank Group', exchange: 'TYO', base: 8800, aliases: ['softbank'] },
  { symbol: '6861.T', name: 'Keyence', exchange: 'TYO', base: 70000 },
  { symbol: '6501.T', name: 'Hitachi', exchange: 'TYO', base: 3600 },
  { symbol: '8306.T', name: 'Mitsubishi UFJ Financial Group', exchange: 'TYO', base: 1550, aliases: ['mufg'] },
  { symbol: '8058.T', name: 'Mitsubishi Corporation', exchange: 'TYO', base: 3100 },
  { symbol: '8001.T', name: 'Itochu', exchange: 'TYO', base: 7600 },
  { symbol: '6098.T', name: 'Recruit Holdings', exchange: 'TYO', base: 8600 },
  { symbol: '4661.T', name: 'Oriental Land', exchange: 'TYO', base: 4300, aliases: ['tokyo disney'] },
  { symbol: '7267.T', name: 'Honda Motor', exchange: 'TYO', base: 1650, aliases: ['honda'] },
  { symbol: '4901.T', name: 'Fujifilm', exchange: 'TYO', base: 3700 },
  { symbol: '2503.T', name: 'Kirin Holdings', exchange: 'TYO', base: 2100, aliases: ['kirin beer'] },
  { symbol: '2914.T', name: 'Japan Tobacco', exchange: 'TYO', base: 4300, aliases: ['jt'] },
  { symbol: 'SMNNY', name: 'Shimano', exchange: 'OTC', base: 18 },

  // Europe
  { symbol: 'ASML.AS', name: 'ASML Holding', exchange: 'AMS', base: 870 },
  { symbol: 'SAP.DE', name: 'SAP', exchange: 'XETRA', base: 190 },
  { symbol: 'SIE.DE', name: 'Siemens', exchange: 'XETRA', base: 175 },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom', exchange: 'XETRA', base: 23 },
  { symbol: 'ALV.DE', name: 'Allianz', exchange: 'XETRA', base: 260 },
  { symbol: 'MUV2.DE', name: 'Munich Re', exchange: 'XETRA', base: 430 },
  { symbol: 'VNA.DE', name: 'Vonovia', exchange: 'XETRA', base: 28 },
  { symbol: 'MBG.DE', name: 'Mercedes-Benz Group', exchange: 'XETRA', base: 65, aliases: ['mercedes'] },
  { symbol: 'BMW.DE', name: 'BMW', exchange: 'XETRA', base: 88 },
  { symbol: 'VOW3.DE', name: 'Volkswagen', exchange: 'XETRA', base: 110, aliases: ['vw'] },
  { symbol: 'ADS.DE', name: 'Adidas', exchange: 'XETRA', base: 225 },
  { symbol: 'RWE.DE', name: 'RWE', exchange: 'XETRA', base: 34 },
  { symbol: 'AIR.PA', name: 'Airbus', exchange: 'PAR', base: 145 },
  { symbol: 'OR.PA', name: "L'Oréal", exchange: 'PAR', base: 410, aliases: ['loreal'] },
  { symbol: 'MC.PA', name: 'LVMH', exchange: 'PAR', base: 720, aliases: ['louis vuitton', 'moet hennessy'] },
  { symbol: 'RMS.PA', name: 'Hermès', exchange: 'PAR', base: 2200, aliases: ['hermes'] },
  { symbol: 'TTE.PA', name: 'TotalEnergies', exchange: 'PAR', base: 65, aliases: ['total'] },
  { symbol: 'SAN.PA', name: 'Sanofi', exchange: 'PAR', base: 95 },
  { symbol: 'AI.PA', name: 'Air Liquide', exchange: 'PAR', base: 165 },
  { symbol: 'NESN.SW', name: 'Nestlé', exchange: 'SWX', base: 92, aliases: ['nestle'] },
  { symbol: 'NOVN.SW', name: 'Novartis', exchange: 'SWX', base: 95 },
  { symbol: 'ROG.SW', name: 'Roche', exchange: 'SWX', base: 270 },
  { symbol: 'UBSG.SW', name: 'UBS Group', exchange: 'SWX', base: 28 },
  { symbol: 'NOVO-B.CO', name: 'Novo Nordisk', exchange: 'CPH', base: 620 },
  { symbol: 'VWS.CO', name: 'Vestas Wind Systems', exchange: 'CPH', base: 160, aliases: ['wind'] },
  { symbol: 'MAERSK-B.CO', name: 'A.P. Moller - Maersk', exchange: 'CPH', base: 12000, aliases: ['maersk'] },
  { symbol: 'IBE.MC', name: 'Iberdrola', exchange: 'BME', base: 12 },
  { symbol: 'ITX.MC', name: 'Inditex', exchange: 'BME', base: 44, aliases: ['zara'] },
  { symbol: 'EQNR.OL', name: 'Equinor', exchange: 'OSL', base: 300 },

  // UK
  { symbol: 'AZN.L', name: 'AstraZeneca', exchange: 'LSE', base: 12000 },
  { symbol: 'SHEL.L', name: 'Shell', exchange: 'LSE', base: 2800 },
  { symbol: 'ULVR.L', name: 'Unilever', exchange: 'LSE', base: 4400 },
  { symbol: 'HSBA.L', name: 'HSBC Holdings', exchange: 'LSE', base: 680 },
  { symbol: 'GSK.L', name: 'GSK', exchange: 'LSE', base: 1600 },
  { symbol: 'DGE.L', name: 'Diageo', exchange: 'LSE', base: 2600 },
  { symbol: 'BP.L', name: 'BP', exchange: 'LSE', base: 480 },

  // Asia-Pacific
  { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing', exchange: 'NYSE', base: 170, aliases: ['tsmc'] },
  { symbol: '005930.KS', name: 'Samsung Electronics', exchange: 'KRX', base: 75000, aliases: ['samsung'] },
  { symbol: '035420.KS', name: 'Naver', exchange: 'KRX', base: 180000 },
  { symbol: '0700.HK', name: 'Tencent Holdings', exchange: 'HKEX', base: 370, aliases: ['wechat'] },
  { symbol: '9988.HK', name: 'Alibaba Group', exchange: 'HKEX', base: 78, aliases: ['alibaba', 'taobao'] },
  { symbol: 'BABA', name: 'Alibaba Group', exchange: 'NYSE', base: 80, aliases: ['alibaba', 'taobao'] },
  { symbol: 'SE', name: 'Sea Limited', exchange: 'NYSE', base: 70, aliases: ['shopee', 'garena'] },
  { symbol: 'BHP.AX', name: 'BHP Group', exchange: 'ASX', base: 45 },
  { symbol: 'CSL.AX', name: 'CSL', exchange: 'ASX', base: 285 },
  { symbol: 'CBA.AX', name: 'Commonwealth Bank of Australia', exchange: 'ASX', base: 120, aliases: ['cba'] },
  { symbol: 'WES.AX', name: 'Wesfarmers', exchange: 'ASX', base: 65 },

  // Broad market placeholders for demo players who think in funds.
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSEARCA', base: 530, aliases: ['s&p 500', 'sp500'] },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', base: 450, aliases: ['nasdaq 100'] },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', exchange: 'NYSEARCA', base: 260, aliases: ['total market'] },
  { symbol: 'VWCE.DE', name: 'Vanguard FTSE All-World ETF', exchange: 'XETRA', base: 120, aliases: ['all world', 'ftse all-world'] },
];

function catalogText(entry) {
  return [entry.symbol, entry.name, entry.exchange, ...(entry.aliases || [])]
    .join(' ')
    .toLowerCase();
}

function catalogScore(entry, needle) {
  const symbol = entry.symbol.toLowerCase();
  const name = entry.name.toLowerCase();
  const aliases = (entry.aliases || []).map((alias) => alias.toLowerCase());
  if (symbol === needle || name === needle || aliases.includes(needle)) return 0;
  if (symbol.startsWith(needle)) return 1;
  if (name.startsWith(needle) || aliases.some((alias) => alias.startsWith(needle))) return 2;
  return 3;
}

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
        .filter((c) => catalogText(c).includes(needle))
        .sort((a, b) => catalogScore(a, needle) - catalogScore(b, needle) || a.name.localeCompare(b.name))
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
