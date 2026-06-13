# Security & data model

How Fantasy Portfolio stores data, what the keys are, and why publishing the
frontend openly on GitHub Pages is safe.

## Where the data lives

| Data | Where | Notes |
|---|---|---|
| Game data (players, seasons, picks, prices, price history) | Supabase Postgres, project `gtjbzmvhmdavvdikqbng`, region `eu-west-1` (AWS Ireland) | The only persistent store |
| Player identity | Supabase Auth (same project) | Email address only; no passwords exist (magic links) |
| Your signed-in session | Browser `localStorage` | A JWT scoped to *your* user; cleared on sign-out |
| Demo-mode state | Browser `localStorage` (`fp-demo`) | Fake data, never leaves the machine |
| Code + anon key | GitHub (`Hempfele/stocks`, public) and GitHub Pages | **No game data** — Pages serves static files only |
| Stock quotes | Fetched from Yahoo Finance **by edge functions** (server-side) | Only ticker symbols are sent; nothing about players |

## The keys, and where each one is

| Key | Lives | Power | Secret? |
|---|---|---|---|
| **anon key** | `js/config.js`, committed, shipped to every browser | Lets a browser talk to the project; every query still passes row-level security | **No — publishable by design.** Supabase's model: this key grants only what RLS policies allow, which for a stranger is *nothing* |
| **service_role key** | Only inside Supabase's edge-function runtime (auto-injected env var) | Bypasses RLS — full database access | **Yes.** Never in the repo, never in the browser. Used only by `make-pick` / `refresh-prices` |
| **User session JWT** | The signed-in player's browser | Act as that one player (read game data, edit own profile) | Per-person; expires and refreshes |
| **CLI access token** | Bernd's macOS keychain (`supabase login`) | Admin: migrations, function deploys | Yes — stays on the Mac |
| **Database password** | Bernd's password manager | Direct Postgres access | Yes — not needed day-to-day |

## Who can do what (enforced by the database, not the UI)

- **Not signed in:** nothing. Every table has RLS enabled and no anonymous policies.
- **Signed in:** read all game tables (that *is* the game — you see each other's
  picks); insert/update **only your own** `players` row.
- **Nobody** (not even a signed-in player) can write `picks`, `seasons`,
  `prices`, or `price_snapshots` directly. Picks exist only via the `make-pick`
  edge function, which:
  1. verifies your JWT (who you are),
  2. checks the season is active,
  3. fetches the live quote **server-side** (so a locked price can't be forged),
  4. inserts with the service role.
- Picks have **no update or delete policy** and a unique constraint per
  (season, player, area): locked means locked, one stock per area, enforced by
  Postgres itself.

The remaining open surface: while "Allow new users to sign up" is enabled in
Supabase Auth, anyone who knows the URL can create an account and *see* the
game. **Close it once all intended players have joined** (Supabase → Auth →
Sign In / Up). Magic-link identity means: whoever controls the email inbox is
that player.

## Live (GitHub Pages) vs local — same thing, different origin

GitHub Pages is **not a backend**. It serves the same static files that
`./play.sh` serves from `localhost:8765`. In both cases your *browser* talks
directly to Supabase over HTTPS:

```
 browser (Pages or localhost)
   ├── Supabase Auth        magic-link sign-in → session JWT
   ├── Supabase PostgREST   reads, filtered by RLS + your JWT
   └── Edge functions       stock-search / make-pick / refresh-prices
                              └── Yahoo Finance (server-side, no keys)
```

The only differences between live and local:

1. **The origin URL** — which is why both `https://hempfele.github.io/stocks/*`
   and `http://localhost:8765/*` must be in Supabase's auth redirect allow
   list (magic links refuse to land anywhere else).
2. **Reachability** — player 2 can reach the Pages URL; localhost is you only.

And `./play.sh demo` (`?demo` in the URL) is a third mode: zero network calls,
all data fake and in-memory/localStorage — safe to hand to anyone.

## Threat model, honestly

This protects a friendly game against accidents, cheating, and drive-by
visitors — not against a motivated attacker with control of a player's email.
The worst realistic outcomes: a stranger joins before sign-ups are closed and
sees picks, or Yahoo's unofficial API breaks and prices go stale. Money is
never involved; nothing here moves real funds.
