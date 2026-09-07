-- Extend role enum to support moderator and rehber (guide) roles.
-- These roles currently have no permissions; they will be used for Live Support later.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin', 'moderator', 'rehber'));
