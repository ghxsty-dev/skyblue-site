-- Expand roles: add developer hierarchy and rename admin to kurucu.
-- Add banned flag and signup IP tracking.

-- 1. First drop the old constraint so the UPDATE below can run
alter table public.profiles
  drop constraint if exists profiles_role_check;

-- 2. Migrate existing 'admin' rows to 'kurucu' BEFORE adding new constraint
update public.profiles set role = 'kurucu' where role = 'admin';

-- 3. Now add the new constraint
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'kurucu', 'bas-gelirtici', 'gelirtici', 'k-gelirtici', 'moderator', 'rehber'));

alter table public.profiles
  add column if not exists banned boolean not null default false;

alter table public.profiles
  add column if not exists signup_ip text;
