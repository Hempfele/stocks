# Fantasy Portfolio — working notes

## Current status (2026-06-13) — pick up here

Phase 2 (go-live) is **half done**:

- ✅ Supabase project created: `https://gtjbzmvhmdavvdikqbng.supabase.co` (ref `gtjbzmvhmdavvdikqbng`)
- ✅ Supabase CLI installed (brew)
- ⏸️ **Next action:** `supabase login` (interactive, user must run it), then
  `supabase link --project-ref gtjbzmvhmdavvdikqbng` → `supabase db push` →
  `supabase functions deploy stock-search make-pick refresh-prices`
- Then: seed Season 1 (dates TBD), set auth Site URL to the Pages URL
  (+ `http://localhost:8765` for local), fill `js/config.js` (URL + anon key,
  safe to commit), and after both players signed in: disable public sign-ups
  in Supabase Auth settings.

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
