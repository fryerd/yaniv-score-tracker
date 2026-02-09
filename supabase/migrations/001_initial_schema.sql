-- ============================================================
-- Yaniv Score Tracker — Phase 1 Schema
-- ============================================================

-- 1. Profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone can read profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Only the owner can update their profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Games (saved game data)
-- ============================================================
create table public.games (
  id uuid primary key default gen_random_uuid(),
  share_token text unique not null,
  game_data jsonb not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  played_at timestamptz not null,
  player_names text[] not null default '{}',
  winner_name text,
  round_count integer not null default 0,
  player_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

-- Everyone can view games (for shared links)
create policy "Games are viewable by everyone"
  on public.games for select
  using (true);

-- Authenticated users can insert their own games
create policy "Authenticated users can insert own games"
  on public.games for insert
  with check (auth.uid() = created_by);

-- Only the creator can update their games
create policy "Users can update own games"
  on public.games for update
  using (auth.uid() = created_by);

-- Index for share token lookups
create index idx_games_share_token on public.games(share_token);

-- Index for user's games
create index idx_games_created_by on public.games(created_by);

-- 3. Player Claims (links users to player slots)
-- ============================================================
create table public.player_claims (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  player_name text not null,
  created_at timestamptz not null default now(),

  -- One claim per user per game
  unique(game_id, user_id),
  -- One user per player slot
  unique(game_id, player_id)
);

alter table public.player_claims enable row level security;

-- Everyone can view claims
create policy "Claims are viewable by everyone"
  on public.player_claims for select
  using (true);

-- Authenticated users can claim a player slot (must be themselves)
create policy "Users can insert own claims"
  on public.player_claims for insert
  with check (auth.uid() = user_id);

-- Game creator can delete claims
create policy "Game creator can delete claims"
  on public.player_claims for delete
  using (
    auth.uid() = (select created_by from public.games where id = game_id)
  );

-- Index for game claims lookup
create index idx_player_claims_game_id on public.player_claims(game_id);
