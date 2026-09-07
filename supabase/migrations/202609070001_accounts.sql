create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_path text,
  signup_ip_hash text not null unique,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create table if not exists public.tools (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.tools (slug, name)
values ('minecraft-rank', 'Minecraft Rank Generator')
on conflict (slug) do update set name = excluded.name;

create table if not exists public.discord_links (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  discord_user_id text not null unique,
  discord_username text not null,
  discord_avatar text,
  verified_at timestamptz not null default now()
);

create table if not exists public.discord_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.license_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  code_prefix text not null,
  tool_slug text not null references public.tools(slug),
  duration_months integer not null check (duration_months in (1, 3, 12)),
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tool_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tool_slug text not null references public.tools(slug),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  license_code_id uuid references public.license_codes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create table if not exists public.tool_daily_usage (
  user_id uuid not null references public.profiles(id) on delete cascade,
  tool_slug text not null references public.tools(slug),
  usage_date date not null,
  download_count integer not null default 0 check (download_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_slug, usage_date)
);

create index if not exists tool_entitlements_active_idx
  on public.tool_entitlements (user_id, tool_slug, expires_at);
create index if not exists license_codes_recent_idx
  on public.license_codes (created_at desc);
create index if not exists discord_verification_codes_user_idx
  on public.discord_verification_codes (user_id, created_at desc);
create unique index if not exists discord_verification_codes_one_active_idx
  on public.discord_verification_codes (user_id)
  where consumed_at is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_username text := lower(trim(new.raw_user_meta_data ->> 'username'));
  new_ip_hash text := new.raw_app_meta_data ->> 'signup_ip_hash';
begin
  if new_username is null or new_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'invalid_username';
  end if;

  if new_ip_hash is null or length(new_ip_hash) <> 64 then
    raise exception 'invalid_signup_ip';
  end if;

  insert into public.profiles (id, username, signup_ip_hash)
  values (new.id, new_username, new_ip_hash);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.prevent_username_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.username is distinct from old.username then
    raise exception 'username_is_immutable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_prevent_username_change on public.profiles;
create trigger profiles_prevent_username_change
  before update on public.profiles
  for each row execute procedure public.prevent_username_change();

create or replace function public.touch_entitlement()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists tool_entitlements_touch on public.tool_entitlements;
create trigger tool_entitlements_touch
  before update on public.tool_entitlements
  for each row execute procedure public.touch_entitlement();

alter table public.profiles enable row level security;
alter table public.tools enable row level security;
alter table public.discord_links enable row level security;
alter table public.discord_verification_codes enable row level security;
alter table public.license_codes enable row level security;
alter table public.tool_entitlements enable row level security;
alter table public.tool_daily_usage enable row level security;

drop policy if exists "Public profiles are visible" on public.profiles;
drop policy if exists "Users see their own profile" on public.profiles;
create policy "Users see their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Tools are public" on public.tools;
create policy "Tools are public"
  on public.tools for select
  using (true);

drop policy if exists "Users see their Discord link" on public.discord_links;
create policy "Users see their Discord link"
  on public.discord_links for select
  using (auth.uid() = user_id);

drop policy if exists "Users see their entitlements" on public.tool_entitlements;
create policy "Users see their entitlements"
  on public.tool_entitlements for select
  using (auth.uid() = user_id);

drop policy if exists "Users see their usage" on public.tool_daily_usage;
create policy "Users see their usage"
  on public.tool_daily_usage for select
  using (auth.uid() = user_id);

create or replace function public.redeem_license_code(p_code_hash text, p_tool_slug text)
returns timestamptz
language plpgsql
security definer set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  selected_code public.license_codes%rowtype;
  current_expiry timestamptz;
  next_expiry timestamptz;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text || ':' || p_tool_slug, 0));

  select * into selected_code
  from public.license_codes
  where code_hash = p_code_hash
    and tool_slug = p_tool_slug
    and redeemed_at is null
    and revoked_at is null
  for update;

  if selected_code.id is null then
    raise exception 'invalid_or_used_code';
  end if;

  select expires_at into current_expiry
  from public.tool_entitlements
  where user_id = current_user_id and tool_slug = p_tool_slug
  for update;

  next_expiry := greatest(coalesce(current_expiry, now()), now())
    + make_interval(months => selected_code.duration_months);

  insert into public.tool_entitlements (
    user_id, tool_slug, starts_at, expires_at, license_code_id
  ) values (
    current_user_id, p_tool_slug, now(), next_expiry, selected_code.id
  )
  on conflict (user_id, tool_slug) do update
    set expires_at = excluded.expires_at,
        license_code_id = excluded.license_code_id,
        updated_at = now();

  update public.license_codes
  set redeemed_by = current_user_id, redeemed_at = now()
  where id = selected_code.id;

  return next_expiry;
end;
$$;

drop function if exists public.consume_tool_download(text, date, integer);
drop function if exists public.consume_tool_download(text, date);
create or replace function public.consume_tool_download(
  p_tool_slug text
)
returns table (allowed boolean, used integer, remaining integer, premium boolean)
language plpgsql
security definer set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  active_premium boolean;
  free_limit integer;
  next_count integer;
  usage_day date := (now() at time zone 'Europe/Istanbul')::date;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select exists (
    select 1 from public.tool_entitlements
    where user_id = current_user_id
      and tool_slug = p_tool_slug
      and expires_at > now()
  ) into active_premium;

  if active_premium then
    return query select true, 0, -1, true;
    return;
  end if;

  select case when exists (
    select 1 from public.discord_links where user_id = current_user_id
  ) then 4 else 2 end into free_limit;

  insert into public.tool_daily_usage (user_id, tool_slug, usage_date, download_count)
  values (current_user_id, p_tool_slug, usage_day, 1)
  on conflict (user_id, tool_slug, usage_date) do update
    set download_count = public.tool_daily_usage.download_count + 1,
        updated_at = now()
    where public.tool_daily_usage.download_count < free_limit
  returning download_count into next_count;

  if next_count is null then
    select download_count into next_count
    from public.tool_daily_usage
    where user_id = current_user_id
      and tool_slug = p_tool_slug
      and usage_date = usage_day;
    return query select false, next_count, 0, false;
  else
    return query select true, next_count, greatest(free_limit - next_count, 0), false;
  end if;
end;
$$;

create or replace function public.verify_discord_code(
  p_code_hash text,
  p_discord_user_id text,
  p_discord_username text,
  p_discord_avatar text default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  selected_code public.discord_verification_codes%rowtype;
begin
  select * into selected_code
  from public.discord_verification_codes
  where code_hash = p_code_hash
    and consumed_at is null
    and expires_at > now()
  for update;

  if selected_code.id is null then
    raise exception 'invalid_or_expired_code';
  end if;

  if exists (
    select 1 from public.discord_links
    where discord_user_id = p_discord_user_id
      and user_id <> selected_code.user_id
  ) then
    raise exception 'discord_already_linked';
  end if;

  insert into public.discord_links (
    user_id, discord_user_id, discord_username, discord_avatar, verified_at
  ) values (
    selected_code.user_id, p_discord_user_id, p_discord_username, p_discord_avatar, now()
  )
  on conflict (user_id) do update
    set discord_user_id = excluded.discord_user_id,
        discord_username = excluded.discord_username,
        discord_avatar = excluded.discord_avatar,
        verified_at = now();

  update public.discord_verification_codes
  set consumed_at = now()
  where id = selected_code.id;

  return selected_code.user_id;
end;
$$;

revoke all on function public.redeem_license_code(text, text) from public;
grant execute on function public.redeem_license_code(text, text) to authenticated;
revoke all on function public.consume_tool_download(text) from public;
grant execute on function public.consume_tool_download(text) to authenticated;
revoke all on function public.verify_discord_code(text, text, text, text) from public;
grant execute on function public.verify_discord_code(text, text, text, text) to service_role;

revoke all on table public.profiles from anon, authenticated;
grant select (id, username, avatar_path, role, created_at, updated_at) on public.profiles to authenticated;
revoke all on table public.discord_links from anon, authenticated;
grant select on public.discord_links to authenticated;
revoke all on table public.tool_entitlements from anon, authenticated;
grant select on public.tool_entitlements to authenticated;
revoke all on table public.tool_daily_usage from anon, authenticated;
grant select on public.tool_daily_usage to authenticated;
revoke all on table public.license_codes from anon, authenticated;
revoke all on table public.discord_verification_codes from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
