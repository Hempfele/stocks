# Fantasy Portfolio — working notes

## Current status (2026-06-13) — pick up here

Phase 2 (go-live): **backend is live**, two browser steps remain.

- ✅ Supabase project `gtjbzmvhmdavvdikqbng` linked; schema pushed (001 + 002),
  functions deployed (`stock-search` smoke-tested with live Yahoo data)
- ✅ Pilot Season seeded: 2026-06-13 → 2026-07-31
- ✅ `js/config.js` filled (anon key, safe to commit); app verified in live mode
- ⏸️ **User, in browser:**
  1. Enable GitHub Pages: repo settings → Pages → deploy from branch `bernd`,
     root → URL will be `https://hempfele.github.io/stocks/`
  2. Supabase → Auth → URL Configuration: Site URL
     `https://hempfele.github.io/stocks/`; redirect allow list:
     `http://localhost:8765/*` and `https://hempfele.github.io/stocks/*`
- Then: both players sign in via magic link, pick stocks, and **disable public
  sign-ups** in Supabase Auth settings.
- Note: `gh` CLI here is logged in as `beplonts_microsoft` (read-only on
  `Hempfele/stocks`), so repo settings must be changed as Hempfele in the browser.

## Constraints

- **No build step.** Vanilla ES modules only; the repo deploys to GitHub Pages as-is.
- **Demo mode first.** `js/config.js` with empty values runs the full game on fake
  data — verify changes there before touching Supabase parts.
- **Lightweight spirit.** The game is about values, not analytics. Resist adding
  charts, stats, and finance jargon; numbers stay understated.

## Devlog practice

`devlog/index.html` is the project's shared memory (format modeled on
`~/PARALocal/vibes/onsen-claude/devlog`). **Every working session ends with:**

1. A new dated `<article class="entry">` at the **top** of the `#log` section:
   what changed, decided for / decided against, a screenshot in `devlog/img/`
   when the change is visual.
2. Updating the standing sections if they drifted: Timeline badges
   (DONE/NOW/NEXT), Next steps, Decisions.

## Verification

- Serve locally (`python3 -m http.server 8000`) or use the `run-web` skill;
  demo mode must let you: sign in → set name → pick all 10 areas via search →
  see the dashboard with both players and moving values.
- Supabase changes: keep `supabase/migrations/` and `supabase/functions/` in
  sync with what's deployed; go-live steps live in README.md.
