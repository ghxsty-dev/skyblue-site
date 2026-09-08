-- Premium üyelerin profil banner görseli (avatars düzeniyle aynı).
alter table public.profiles
  add column if not exists banner_path text;

grant select (banner_path)
  on public.profiles to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('banners', 'banners', true, 10485760, array['image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
