alter table public.rank_projects
  add column if not exists icon_left text not null default 'none',
  add column if not exists icon_right text not null default 'none',
  add column if not exists icon_color text not null default '#ffffff';
