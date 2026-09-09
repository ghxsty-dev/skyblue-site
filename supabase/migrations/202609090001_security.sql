-- Hesap güvenliği: şifre sıfırlama kodları, DB tabanlı rate limit, oturum iptali.

-- 1. Şifre sıfırlama kodları (Discord DM ile iletilir, tek kullanımlık).
create table if not exists public.password_reset_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists password_reset_codes_user_idx
  on public.password_reset_codes (user_id, created_at desc);

alter table public.password_reset_codes enable row level security;
revoke all on table public.password_reset_codes from anon, authenticated;

-- 2. Rate limit sayaçları (yalnızca service_role erişir).
create table if not exists public.rate_limit_hits (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_hits_key_idx
  on public.rate_limit_hits (key, created_at desc);

alter table public.rate_limit_hits enable row level security;
revoke all on table public.rate_limit_hits from anon, authenticated;

-- 3. Oturum iptali: bu zamandan önce üretilmiş tokenlar geçersiz sayılır.
alter table public.profiles
  add column if not exists force_logout_at timestamptz;

-- Oturum tazelik kontrolü sunucu istemcisiyle okunur; sütünü izne ekle.
revoke all on table public.profiles from anon, authenticated;
grant select (id, username, avatar_path, role, created_at, updated_at, force_logout_at)
  on public.profiles to authenticated;
