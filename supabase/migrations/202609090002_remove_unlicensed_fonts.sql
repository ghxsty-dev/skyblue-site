-- Lisansi ticari/web kullanimina uygun olmayan fontlar kaldirildi:
-- minicomputer (Typodermic, web-embed ucretli), penmanship (KG, kisisel
-- kullanim), hello-baby (ticari kullanim yasak). Bu fontu secmis
-- kayitlari varsayilana dondur.
update public.profiles
set name_font = 'default',
    updated_at = now()
where name_font in ('minicomputer', 'penmanship', 'hello-baby');
