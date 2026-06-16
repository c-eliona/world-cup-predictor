-- World Cup 2026 Predictor — Supabase Schema
-- Paste this into your Supabase SQL Editor and click Run

-- Players table
create table if not exists players (
  id text primary key,
  name text not null,
  name_lower text not null unique,
  created_at timestamptz default now()
);

-- Matches table
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  home_team text not null,
  away_team text not null,
  kickoff timestamptz not null,
  round text not null,
  "group" text,
  home_score integer,
  away_score integer,
  finished boolean not null default false
);

-- Predictions table
create table if not exists predictions (
  id text primary key,             -- format: {player_id}_{match_id}
  player_id text not null references players(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  home_prediction integer not null,
  away_prediction integer not null,
  points integer not null default 0,
  saved_at timestamptz default now()
);

-- Indexes for fast queries
create index if not exists idx_predictions_player_id on predictions(player_id);
create index if not exists idx_predictions_match_id on predictions(match_id);
create index if not exists idx_matches_kickoff on matches(kickoff);

-- Row Level Security
alter table players enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;

-- Policies: allow all operations from anon/authenticated (public app, no auth)
create policy "Allow all on players" on players for all to anon, authenticated using (true) with check (true);
create policy "Allow all on matches" on matches for all to anon, authenticated using (true) with check (true);
create policy "Allow all on predictions" on predictions for all to anon, authenticated using (true) with check (true);

-- Enable Realtime on all tables
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table predictions;
