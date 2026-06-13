-- Fantasy Portfolio — initial schema

create table public.players (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at date not null,
  ends_at date not null,
  created_at timestamptz not null default now()
);

create table public.picks (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  player_id uuid not null references public.players (id) on delete cascade,
  area_key text not null,
  symbol text not null,
  name text not null,
  currency text not null default 'USD',
  locked_price numeric not null check (locked_price > 0),
  locked_at timestamptz not null default now(),
  unique (season_id, player_id, area_key)
);

create table public.prices (
  symbol text primary key,
  price numeric not null,
  currency text,
  fetched_at timestamptz not null default now()
);

-- Row-level security: players see everything, write only their own profile.
-- Picks and prices are written exclusively by edge functions (service role
-- bypasses RLS), so locked prices can't be forged from the client.
alter table public.players enable row level security;
alter table public.seasons enable row level security;
alter table public.picks  enable row level security;
alter table public.prices enable row level security;

create policy "players readable by players" on public.players
  for select to authenticated using (true);
create policy "create own profile" on public.players
  for insert to authenticated with check (id = auth.uid());
create policy "update own profile" on public.players
  for update to authenticated using (id = auth.uid());

create policy "seasons readable" on public.seasons
  for select to authenticated using (true);
create policy "picks readable" on public.picks
  for select to authenticated using (true);
create policy "prices readable" on public.prices
  for select to authenticated using (true);

-- Seed the first season (adjust dates before going live):
-- insert into public.seasons (name, starts_at, ends_at)
-- values ('Season 1', '2026-07-01', '2026-09-30');
