alter table public.rank_projects
  add column if not exists bg_mode text not null default 'gradient',
  add column if not exists gradient_from text not null default '#fff6a5',
  add column if not exists gradient_to text not null default '#ffaa00',
  add column if not exists gradient_dir text not null default 'vertical',
  add column if not exists gradient_preset text not null default 'sunny',
  add column if not exists solid_color text not null default '#59abfe';
