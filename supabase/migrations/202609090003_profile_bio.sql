-- Profil hakkinda yazisi (en fazla 100 karakter, duz metin).
alter table public.profiles
  add column if not exists bio text not null default '';

alter table public.profiles
  drop constraint if exists profiles_bio_length;

alter table public.profiles
  add constraint profiles_bio_length check (char_length(bio) <= 100);

-- Hesap ve public profil sayfalari (RLS: kendi satiri + admin) okuyabilsin.
grant select (bio)
  on public.profiles to authenticated;
