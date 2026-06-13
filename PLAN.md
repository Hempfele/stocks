# Fantasy Portfolio — Plan

_From the voice note of 2026-06-13 (transcript: `~/Desktop/Fantasy Portfolio.transcript.md`)_

## The game

A lightweight web game for two players (later more). Each player builds a **life portfolio**: 10 areas modeled after the hierarchy of needs, one stock per area. Picking a stock locks its price and virtually buys **€1,000** of it. Over a **season**, everyone watches the portfolios evolve and sees each other's picks. At season end there's a winner.

**Spirit:** not about money and analytics. It's about which companies reflect the life you want to live. The UI stays warm and simple — picks and stories first, numbers second.

## The 10 areas (hierarchy of needs, bottom to top)

| # | Area | Question it asks |
|---|------|------------------|
| 1 | 🍞 Nourishment | What feeds you? |
| 2 | 🏠 Home & Shelter | Where does life happen? |
| 3 | ❤️ Health & Body | What keeps you well? |
| 4 | ⚡ Energy & Resources | What powers it all? |
| 5 | 🛡️ Safety & Security | What do you rely on? |
| 6 | 🚲 Mobility | How do you move through the world? |
| 7 | 💬 Connection | How do you stay close? |
| 8 | 🎮 Play & Joy | What makes you smile? |
| 9 | 📚 Learning & Growth | How do you become more? |
| 10 | 🚀 Dreams & Frontier | What future do you want to see? |

## Architecture (decided 2026-06-13)

- **Frontend:** static site, vanilla ES modules, no build step → deploys straight to **GitHub Pages**.
- **Backend:** **Supabase** free tier — magic-link email auth, Postgres with row-level security, Edge Functions.
- **Stock search & prices:** Yahoo Finance (unofficial API), proxied through Edge Functions so there are no CORS issues and no API keys in the client. Covers US **and** European exchanges.
- **Currency:** performance is ratio-based (€1,000 × current/locked per pick), so mixed-currency portfolios compare fairly without FX conversion.
- **Demo mode:** with no Supabase config the app runs on in-memory fake data — instantly previewable locally.

### Data model

- `players` — id (= auth user), display_name
- `seasons` — name, starts_at, ends_at (active season = today within range)
- `picks` — season, player, area_key, symbol, name, locked_price, locked_at; unique per (season, player, area); insert-only (no edits once locked), written server-side by the `make-pick` function so the locked price is trustworthy
- `prices` — latest quote per symbol, refreshed by the `refresh-prices` function (throttled)

### Edge Functions

- `stock-search` — typeahead: query Yahoo search, return symbol/name/exchange
- `make-pick` — verify the signed-in user, fetch the live quote, insert the locked pick
- `refresh-prices` — update quotes for all picked symbols in active seasons (skips anything fresher than 30 min)

## Phases

- **Phase 1 — playable game (this build):** auth, pick flow with typeahead, locked prices, dashboard comparing all players, season header with countdown, demo mode.
- **Phase 2 — go live:** create Supabase project, push migrations + functions, seed Season 1, enable GitHub Pages, invite player 2.
- **Phase 3 — season life:** weekly update notification (options: Supabase cron + Resend email, or Pi cron + the existing Telegram skill), price history snapshots + sparklines, season-end winner ceremony, archive of past seasons.
- **Later:** 3+ players, "why I picked this" notes per pick, season themes.
