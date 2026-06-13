# 🏛️ Fantasy Portfolio

A lightweight web game: build a **life portfolio** — 10 areas of life modeled after the
hierarchy of needs, one stock for each. Picking locks the live price and virtually buys
€1,000 of it. Watch the portfolios evolve over a season, together.

Not about money and analytics — about the companies that reflect the life you want to see.

📋 Game design and phases: [PLAN.md](PLAN.md) · 📓 Devlog: [devlog/](devlog/)

## Run it now (demo mode)

No setup needed. Serve the folder and open it:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

With `js/config.js` left empty the game runs on fake players and prices —
sign in with one click, pick stocks, see the dashboard move day by day.

## Go live (GitHub Pages + Supabase)

1. **Create a Supabase project** (free tier) at [supabase.com](https://supabase.com).

2. **Apply the schema and deploy the functions** with the [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```sh
   supabase link --project-ref <your-project-ref>
   supabase db push                  # applies supabase/migrations/001_init.sql
   supabase functions deploy stock-search make-pick refresh-prices
   ```

3. **Seed Season 1** (SQL editor in the Supabase dashboard; adjust dates):
   ```sql
   insert into seasons (name, starts_at, ends_at)
   values ('Season 1', '2026-07-01', '2026-09-30');
   ```

4. **Configure auth**: in Supabase → Authentication → URL Configuration, set the
   Site URL to your GitHub Pages URL (e.g. `https://<user>.github.io/stocks/`)
   so magic links redirect back to the game.

5. **Fill `js/config.js`** with the project URL and anon (publishable) key from
   Supabase → Settings → API. The anon key is safe to commit — row-level security
   protects the data.

6. **Enable GitHub Pages**: push to GitHub, then Settings → Pages → deploy from
   branch (root). No build step — the site is served as-is.

7. **Invite player 2**: send them the URL. They sign in with their email,
   pick a name, and start picking.

## How it works

- **Frontend**: vanilla ES modules, no build step (`index.html`, `js/`, `css/`).
- **Data**: Supabase Postgres — `players`, `seasons`, `picks` (insert-only, unique
  per season/player/area), `prices` (latest quote cache). RLS: everyone signed in
  can read everything; picks are written only by the `make-pick` edge function so
  locked prices are trustworthy.
- **Quotes**: Yahoo Finance (covers US and European exchanges), proxied through
  edge functions — no API keys, no CORS issues. `refresh-prices` throttles to one
  fetch per symbol per 30 minutes.
- **Scoring**: each pick is worth €1,000 × (current price / locked price), so
  mixed-currency portfolios compare fairly. Unpicked areas count as €1,000 cash.
