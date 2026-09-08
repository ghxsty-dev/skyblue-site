-- Design products management table.
-- Stores all service/package/product data previously hardcoded in data/services.json.

create table if not exists public.design_products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('package', 'design', 'discord', 'minecraft')),
  slug text,
  data jsonb not null default '{}',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.design_products is 'Design service products, packages, and items managed via admin panel.';
comment on column public.design_products.category is 'package, design, discord, or minecraft';
comment on column public.design_products.data is 'Bilingual product data: { en: {...}, tr: {...} }';

-- Index for ordering
create index if not exists idx_design_products_category_sort on public.design_products(category, sort_order);
