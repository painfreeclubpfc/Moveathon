-- ============================================================
-- Move-a-thon Progress Score (MPS) — Supabase schema  ·  v2
-- Two tables. This is how X and Y are segregated: nothing is keyed
-- to a global week. Every badge is keyed to (member + theme), so a
-- member is "done" when they hold 6 distinct theme-badges, in
-- whatever run(s) they earned them.
--
-- Setup: Supabase → SQL Editor → paste + run. Then copy your project
-- URL + anon key into the CONFIG block in index.html.
-- ============================================================

-- One row per member (their profile + a live rollup).
create table if not exists moveathon_members (
  member_id            text primary key,        -- the member's email (lowercased)
  name                 text,
  phone                text,
  goal                 text,                     -- Day-0 emotional-anchor goal
  cohort_joined        text,                     -- run id they first logged in (e.g. 'C1')
  join_program_week    int,                      -- which program-week they joined at (X=1, Y=2)
  badges_earned        int default 0,            -- 0..6 rollup
  status               text default 'active',    -- active | graduated
  overall              int,                      -- avg of earned badge scores (set at graduation)
  distinction          boolean,                  -- best-4-of-6 avg >= 75 (backend flavour, not a gate)
  final_goal_closeness int,
  final_reflection     text,
  updated_at           timestamptz default now()
);

-- A returning member is matched on EITHER email (member_id) OR mobile, so a
-- typo in one key doesn't split their history. phone is stored as digits only.
create index if not exists moveathon_members_phone_idx on moveathon_members (phone);

-- One row per earned theme-badge. Unique on (member, theme): re-logging
-- a theme updates the same row rather than duplicating.
create table if not exists moveathon_badges (
  member_id         text not null,
  theme_id          int  not null,               -- stable 1..6 (matches across runs)
  theme_name        text,
  cohort_id         text,                         -- run it was earned in (C1, C2, ...)
  program_week      int,                          -- which week of that run
  score             int,                          -- weekly total 0..100
  pain              int,
  confidence        int,
  movement          int,
  strength          int,
  consistency       int,
  challenges        int,                           -- weekly-challenges pillar points (0..20)
  reps              int,                           -- sit-to-stand rep count
  sessions_attended int,                           -- 0..5
  challenges_done   int,                           -- 0..5 mini-challenges completed
  goal_closeness    int,                           -- 0..10 (unscored reflection)
  earned_at         timestamptz default now(),
  primary key (member_id, theme_id)
);

-- "Who has earned all 6 and is eligible for the certificate?"
create or replace view moveathon_certificate_ready as
  select member_id, count(*) as badges, round(avg(score)) as overall_score
  from moveathon_badges
  group by member_id
  having count(*) >= 6;

-- ---- Row Level Security --------------------------------------------------
-- The app writes with the public anon key and reads a member's own badges
-- back by email (to restore a returning member). These policies allow that.
-- If you prefer to lock reads down, move restore behind an Edge Function.
alter table moveathon_members enable row level security;
alter table moveathon_badges  enable row level security;

create policy members_insert on moveathon_members for insert to anon with check (true);
create policy members_update on moveathon_members for update to anon using (true) with check (true);
create policy members_select on moveathon_members for select to anon using (true);

create policy badges_insert on moveathon_badges for insert to anon with check (true);
create policy badges_update on moveathon_badges for update to anon using (true) with check (true);
create policy badges_select on moveathon_badges for select to anon using (true);
