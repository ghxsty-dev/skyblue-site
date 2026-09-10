-- Rank ozellestirme: simge-metin boslugu, kenar stili, ozel simgeler, AI oneri kotasi.
alter table public.rank_projects
  add column if not exists icon_gap integer not null default 0;

alter table public.rank_projects
  add column if not exists corner_style text not null default 'square';

alter table public.rank_projects
  drop constraint if exists rank_projects_corner_check;

alter table public.rank_projects
  add constraint rank_projects_corner_check
  check (corner_style in ('square', 'rounded', 'soft'));

alter table public.rank_projects
  add column if not exists custom_left jsonb;

alter table public.rank_projects
  add column if not exists custom_right jsonb;

create table if not exists public.rank_ai_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  usage_date date not null,
  count integer not null default 0 check (count >= 0),
  primary key (user_id, usage_date)
);

alter table public.rank_ai_usage enable row level security;
revoke all on table public.rank_ai_usage from anon, authenticated;
