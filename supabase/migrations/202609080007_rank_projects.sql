create table if not exists public.rank_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  text text not null default 'VIP',
  font_id text not null default 'block',
  text_color text not null default '#ffffff',
  background jsonb not null default '[]'::jsonb,
  extra_brush_colors jsonb not null default '[]'::jsonb,
  extra_text_colors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rank_projects enable row level security;

create policy "Users can view their own rank projects"
  on public.rank_projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rank projects"
  on public.rank_projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rank projects"
  on public.rank_projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rank projects"
  on public.rank_projects for delete
  using (auth.uid() = user_id);

create index if not exists rank_projects_user_id_idx on public.rank_projects (user_id, updated_at desc);
