import { AREAS, STAKE, areaByKey } from './areas.js';
import { createStore } from './store.js';
import { isDemo } from './config.js';

const app = document.getElementById('app');
let store;
const state = {
  user: null, me: null, season: null,
  players: [], picks: [], prices: new Map(),
  linkSent: false, pickingArea: null, searchResults: [], chosenStock: null,
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtEur = (v) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtPct = (r) => `${r >= 0 ? '+' : ''}${(r * 100).toFixed(1)}%`;

function pickValue(pick) {
  const quote = state.prices.get(pick.symbol);
  const current = quote ? quote.price : pick.locked_price;
  return STAKE * (current / pick.locked_price);
}
function playerTotal(playerId) {
  const picks = state.picks.filter((p) => p.player_id === playerId);
  const invested = picks.reduce((sum, p) => sum + pickValue(p), 0);
  const cash = (AREAS.length - picks.length) * STAKE; // unpicked areas wait as cash
  return invested + cash;
}
function daysLeft() {
  return Math.max(0, Math.ceil((new Date(state.season.ends_at) - new Date()) / 86400000));
}

// ----------------------------------------------------------------- rendering

function render() {
  if (!state.user) return renderSignIn();
  if (!state.me) return renderName();
  if (!state.season) return renderShell('<p class="empty">No active season right now. A new one starts soon. 🌱</p>');
  renderGame();
}

function renderSignIn() {
  app.innerHTML = `
    <div class="hero">
      <div class="hero-emoji">🏛️</div>
      <h1>Fantasy Portfolio</h1>
      <p class="tagline">Ten areas of life. One stock for each.<br>
        Pick the companies that reflect the life you want to see.</p>
      ${state.linkSent
        ? '<p class="notice">✉️ Check your email — your magic link is on the way.</p>'
        : `<form id="signin-form" class="stack">
            ${isDemo
              ? '<button class="primary">Enter the game</button><p class="hint">Demo mode — no account needed. Fill js/config.js to go live.</p>'
              : `<input type="email" id="email" placeholder="you@example.com" required autocomplete="email">
                 <button class="primary">Send me a magic link</button>`}
          </form>`}
    </div>`;
  document.getElementById('signin-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await store.signIn(document.getElementById('email')?.value);
    if (result.sentLink) state.linkSent = true; else await loadAll();
    render();
  });
}

function renderName() {
  app.innerHTML = `
    <div class="hero">
      <div class="hero-emoji">👋</div>
      <h1>Welcome!</h1>
      <p class="tagline">What should the other players call you?</p>
      <form id="name-form" class="stack">
        <input id="name" placeholder="Your name" required maxlength="24">
        <button class="primary">Join the season</button>
      </form>
    </div>`;
  document.getElementById('name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await store.setName(document.getElementById('name').value.trim());
    await loadAll();
    render();
  });
}

function renderShell(content) {
  app.innerHTML = `
    <header class="bar">
      <span class="logo">🏛️ Fantasy Portfolio</span>
      ${state.season ? `<span class="season">${esc(state.season.name)} · ${daysLeft()} days left</span>` : ''}
      <button id="signout" class="ghost">Sign out</button>
    </header>
    ${content}
    ${state.pickingArea ? pickModalHtml() : ''}`;
  document.getElementById('signout').addEventListener('click', async () => {
    await store.signOut();
    Object.assign(state, { user: null, me: null, linkSent: false });
    render();
  });
  if (state.pickingArea) wirePickModal();
}

function renderGame() {
  const myId = state.me.id;
  const others = state.players.filter((p) => p.id !== myId);
  const totals = state.players
    .map((p) => ({ player: p, total: playerTotal(p.id) }))
    .sort((a, b) => b.total - a.total);
  const leaderId = totals.length > 1 && totals[0].total > totals[1].total ? totals[0].player.id : null;

  renderShell(`
    <section class="standings">
      ${totals.map(({ player, total }) => `
        <div class="standing ${player.id === myId ? 'mine' : ''}">
          <span class="who">${player.id === leaderId ? '👑 ' : ''}${esc(player.display_name)}</span>
          <span class="total">${fmtEur(total)}</span>
          <span class="delta ${total >= AREAS.length * STAKE ? 'up' : 'down'}">${fmtPct(total / (AREAS.length * STAKE) - 1)}</span>
        </div>`).join('')}
    </section>
    <section>
      <h2>Your life portfolio</h2>
      <div class="board">${AREAS.map((a) => areaCardHtml(a, myId, true)).join('')}</div>
    </section>
    ${others.map((p) => `
      <section>
        <h2>${esc(p.display_name)}'s picks</h2>
        <div class="board">${AREAS.map((a) => areaCardHtml(a, p.id, false)).join('')}</div>
      </section>`).join('')}`);

  app.querySelectorAll('.card.empty.pickable').forEach((el) =>
    el.addEventListener('click', () => {
      Object.assign(state, { pickingArea: el.dataset.area, searchResults: [], chosenStock: null });
      render();
    }));
}

function areaCardHtml(area, playerId, pickable) {
  const pick = state.picks.find((p) => p.player_id === playerId && p.area_key === area.key);
  if (!pick) {
    return `
      <div class="card empty ${pickable ? 'pickable' : ''}" data-area="${area.key}">
        <div class="area-emoji">${area.emoji}</div>
        <div class="area-title">${area.title}</div>
        <div class="area-q">${area.question}</div>
        ${pickable ? '<div class="cta">Pick a stock →</div>' : '<div class="cta muted">Not picked yet</div>'}
      </div>`;
  }
  const value = pickValue(pick);
  const ratio = value / STAKE - 1;
  return `
    <div class="card picked">
      <div class="card-top"><span class="area-emoji small">${area.emoji}</span>
        <span class="area-title small">${area.title}</span></div>
      <div class="stock-name">${esc(pick.name)}</div>
      <div class="stock-symbol">${esc(pick.symbol)}</div>
      <div class="card-bottom">
        <span class="value">${fmtEur(value)}</span>
        <span class="delta ${ratio >= 0 ? 'up' : 'down'}">${fmtPct(ratio)}</span>
      </div>
    </div>`;
}

// ----------------------------------------------------------------- pick flow

function pickModalHtml() {
  const area = areaByKey(state.pickingArea);
  const s = state.chosenStock;
  return `
    <div class="overlay" id="overlay">
      <div class="modal">
        <button class="close" id="close-modal">×</button>
        <div class="area-emoji">${area.emoji}</div>
        <h3>${area.title}</h3>
        <p class="area-q">${area.question}</p>
        ${s ? `
          <div class="confirm">
            <p><b>${esc(s.name)}</b> <span class="stock-symbol">${esc(s.symbol)}</span></p>
            <p class="hint">This locks today's price and buys ${fmtEur(STAKE)} of it. No take-backs this season.</p>
            <button class="primary" id="lock-in">🔒 Lock it in</button>
            <button class="ghost" id="back">Choose differently</button>
          </div>` : `
          <input id="search" placeholder="Type a company name…" autocomplete="off">
          <ul class="results">
            ${state.searchResults.map((r, i) => `
              <li data-i="${i}"><b>${esc(r.name)}</b>
                <span class="stock-symbol">${esc(r.symbol)}${r.exchange ? ' · ' + esc(r.exchange) : ''}</span></li>`).join('')}
          </ul>`}
      </div>
    </div>`;
}

function wirePickModal() {
  const closeModal = () => { state.pickingArea = null; render(); };
  document.getElementById('close-modal').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target.id === 'overlay') closeModal();
  });

  const search = document.getElementById('search');
  if (search) {
    search.focus();
    let timer;
    search.addEventListener('input', () => {
      clearTimeout(timer);
      const q = search.value.trim();
      timer = setTimeout(async () => {
        if (q.length < 2) return;
        state.searchResults = await store.searchStocks(q);
        const list = document.querySelector('.results');
        if (!list) return;
        list.innerHTML = state.searchResults.map((r, i) => `
          <li data-i="${i}"><b>${esc(r.name)}</b>
            <span class="stock-symbol">${esc(r.symbol)}${r.exchange ? ' · ' + esc(r.exchange) : ''}</span></li>`).join('');
        wireResults();
      }, 250);
    });
    wireResults();
  }

  document.getElementById('back')?.addEventListener('click', () => {
    state.chosenStock = null;
    render();
  });
  document.getElementById('lock-in')?.addEventListener('click', async (e) => {
    e.target.disabled = true;
    e.target.textContent = 'Locking…';
    try {
      await store.makePick(state.season.id, state.pickingArea, state.chosenStock);
      state.pickingArea = null;
      await loadAll();
    } catch (err) {
      alert(`Could not lock the pick: ${err.message}`);
    }
    render();
  });
}

function wireResults() {
  document.querySelectorAll('.results li').forEach((li) =>
    li.addEventListener('click', () => {
      state.chosenStock = state.searchResults[Number(li.dataset.i)];
      render();
    }));
}

// ----------------------------------------------------------------- data load

async function loadAll() {
  state.user = await store.getUser();
  if (!state.user) return;
  state.me = await store.getMe();
  state.season = await store.getActiveSeason();
  if (!state.season || !state.me) return;
  await store.refreshPrices();
  const [players, picks, prices] = await Promise.all([
    store.getPlayers(), store.getPicks(state.season.id), store.getPrices(),
  ]);
  state.players = players;
  state.picks = picks;
  state.prices = new Map(prices.map((p) => [p.symbol, p]));
}

(async function main() {
  store = await createStore();
  store.onAuthChange?.(async (event) => {
    if (event === 'SIGNED_IN' && !state.user) { await loadAll(); render(); }
  });
  await loadAll();
  render();
})();
