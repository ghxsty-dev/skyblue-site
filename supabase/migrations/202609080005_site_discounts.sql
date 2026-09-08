-- Site-wide discounts per service category.
-- Each category (design, minecraft, discord) can have an independent discount.

create table if not exists public.site_discounts (
  id uuid primary key default gen_random_uuid(),
  category text not null unique check (category in ('design', 'minecraft', 'discord')),
  percent numeric not null default 0 check (percent >= 0 and percent <= 100),
  active boolean not null default false,
  label_en text,
  label_tr text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_discounts is 'Per-category discounts applied to design service prices.';

-- Seed default rows
insert into public.site_discounts (category, percent, active) values
  ('design', 0, false),
  ('minecraft', 0, false),
  ('discord', 0, false)
on conflict (category) do nothing;
