-- Expand roles: add developer hierarchy and rename admin to kurucu.
-- Add banned flag and signup IP tracking.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'kurucu', 'bas-gelirtici', 'gelirtici', 'k-gelirtici', 'moderator', 'rehber'));

alter table public.profiles
  add column if not exists banned boolean not null default false;

alter table public.profiles
  add column if not exists signup_ip text;

-- Migrate existing 'admin' rows to 'kurucu'
update public.profiles set role = 'kurucu' where role = 'admin';
