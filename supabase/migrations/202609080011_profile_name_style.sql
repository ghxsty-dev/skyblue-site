-- Premium üyelerin users/ sayfasındaki isim görünümü (font + renk + gradient).
alter table public.profiles
  add column if not exists name_font text not null default 'default',
  add column if not exists name_color_from text not null default '#ffffff',
  add column if not exists name_color_to text;

-- Hesap sayfası (RLS, kendi satırı) yeni sütunları okuyabilsin.
grant select (name_font, name_color_from, name_color_to)
  on public.profiles to authenticated;
