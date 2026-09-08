-- Seed design_products table with existing data from data/services.json.
-- Run this AFTER 202609080003_design_products.sql

-- Packages (4)
insert into public.design_products (category, slug, data, sort_order, visible) values
('package', 'corporate', '{
  "en": {"title": "Corporate Package", "desc": "Full corporate identity including logo, stationery, and brand guidelines.", "slug": "corporate", "basic": 150, "pro": 300, "basicIncludes": ["Logo Design", "Banner", "Social Media Kit"], "proIncludes": ["Logo Design", "Banner", "Letterhead", "Envelope", "Brand Guidelines", "Social Media Kit"]},
  "tr": {"title": "Kurumsal Paket", "desc": "Logo, kırtasiye ve marka kılavuzunu içeren komple kurumsal kimlik paketi.", "slug": "kurumsal", "basic": 150, "pro": 300, "basicIncludes": ["Logo Tasarımı", "Banner", "Sosyal Medya Kiti"], "proIncludes": ["Logo Tasarımı", "Banner", "Antetli Kağıt", "Zarf", "Marka Kılavuzu", "Sosyal Medya Kiti"]}
}', 0, true),

('package', 'social-media', '{
  "en": {"title": "Social Media Package", "desc": "Social media posts, banner, and profile design for all platforms.", "slug": "social-media", "basic": 150, "pro": 300, "basicIncludes": ["3 Instagram Posts (4:5)", "3 Instagram Stories", "1 Banner"], "proIncludes": ["10 Instagram Posts", "5 Instagram Stories", "1 Social Media Banner", "Carousel Template"]},
  "tr": {"title": "Sosyal Medya Paketi", "desc": "Tüm platformlar için sosyal medya gönderileri, banner ve profil tasarımı.", "slug": "sosyal-medya", "basic": 150, "pro": 300, "basicIncludes": ["3 Instagram Gönderisi (4:5)", "3 Instagram Hikaye", "1 Banner"], "proIncludes": ["10 Instagram Gönderisi", "5 Instagram Hikaye", "1 Sosyal Medya Bannerı", "Carousel Şablonu"]}
}', 1, true),

('package', 'minecraft-server', '{
  "en": {"title": "Minecraft Server Package", "desc": "Server logo, banners, thread design, and rank icons.", "slug": "minecraft-server", "basic": 150, "pro": 300, "basicIncludes": ["Server Logo", "1 Server Banner", "Thread Design"], "proIncludes": ["Server Logo", "3 Server Banners", "Thread Design", "Rank Icons Set", "Store Banner"]},
  "tr": {"title": "Minecraft Sunucu Paketi", "desc": "Sunucu logosu, bannerlar, konu tasarımı ve rank ikonları.", "slug": "minecraft-sunucu", "basic": 150, "pro": 300, "basicIncludes": ["Sunucu Logosu", "1 Sunucu Bannerı", "Konu Tasarımı"], "proIncludes": ["Sunucu Logosu", "3 Sunucu Bannerı", "Konu Tasarımı", "Rank İkonları Seti", "Mağaza Bannerı"]}
}', 2, true),

('package', 'discord-server', '{
  "en": {"title": "Discord Server Package", "desc": "Server logo, banner, emoji pack, welcome image, and embed visuals.", "slug": "discord-server", "basic": 150, "pro": 300, "basicIncludes": ["Server Logo", "Server Banner", "5 Custom Emojis"], "proIncludes": ["Server Logo", "Server Banner", "10 Custom Emojis", "Welcome Image", "Embed Images Set", "Partner Banner"]},
  "tr": {"title": "Discord Sunucu Paketi", "desc": "Sunucu logosu, banner, emoji paketi, hoş geldin görseli ve embed tasarımları.", "slug": "discord-sunucu", "basic": 150, "pro": 300, "basicIncludes": ["Sunucu Logosu", "Sunucu Bannerı", "5 Özel Emoji"], "proIncludes": ["Sunucu Logosu", "Sunucu Bannerı", "10 Özel Emoji", "Hoş Geldin Görseli", "Embed Görselleri Seti", "Partner Bannerı"]}
}', 3, true);

-- Design items (13)
insert into public.design_products (category, slug, data, sort_order, visible) values
('design', null, '{"en": {"title": "Logo", "price": 70}, "tr": {"title": "Logo", "price": 70}}', 0, true),
('design', null, '{"en": {"title": "Animation Logo", "price": 120}, "tr": {"title": "Animasyon Logo", "price": 120}}', 1, true),
('design', null, '{"en": {"title": "Mascot Logo", "price": 100}, "tr": {"title": "Maskot Logo", "price": 100}}', 2, true),
('design', null, '{"en": {"title": "Banner", "price": 60}, "tr": {"title": "Banner", "price": 60}}', 3, true),
('design', null, '{"en": {"title": "Instagram Post", "price": 50}, "tr": {"title": "Instagram Gönderisi", "price": 50}}', 4, true),
('design', null, '{"en": {"title": "Instagram Story", "price": 50}, "tr": {"title": "Instagram Hikaye", "price": 50}}', 5, true),
('design', null, '{"en": {"title": "Minecraft Rank Icons", "price": 25, "unit": "per icon"}, "tr": {"title": "Minecraft Rank İkonları", "price": 25, "unit": "ikon başına"}}', 6, true),
('design', null, '{"en": {"title": "Minecraft Thread Design", "price": 150}, "tr": {"title": "Minecraft Konu Tasarımı", "price": 150}}', 7, true),
('design', null, '{"en": {"title": "Valorant Team Design", "price": 120}, "tr": {"title": "Valorant Takım Tasarımı", "price": 120}}', 8, true),
('design', null, '{"en": {"title": "Emoji Pack", "price": 7.5, "unit": "per emoji"}, "tr": {"title": "Emoji Paketi", "price": 7.5, "unit": "emoji başına"}}', 9, true),
('design', null, '{"en": {"title": "Sticker Pack", "price": 10, "unit": "per sticker"}, "tr": {"title": "Sticker Paketi", "price": 10, "unit": "sticker başına"}}', 10, true),
('design', null, '{"en": {"title": "Stream Banner", "price": 50}, "tr": {"title": "Yayın Bannerı", "price": 50}}', 11, true),
('design', null, '{"en": {"title": "Offline Screen", "price": 50}, "tr": {"title": "Offline Ekranı", "price": 50}}', 12, true);

-- Discord bots (4)
insert into public.design_products (category, slug, data, sort_order, visible) values
('discord', null, '{"en": {"title": "Moderation Discord Bot", "desc": "A fully-featured moderation bot with auto-moderation, warning system, logging, and anti-spam protection.", "price": 120}, "tr": {"title": "Moderasyon Discord Botu", "desc": "Auto-mod, uyarı sistemi, loglama ve anti-spam koruması ile tam donanımlı bir moderasyon botu.", "price": 120}}', 0, true),
('discord', null, '{"en": {"title": "Guide Discord Bot", "desc": "An information and guide bot with commands, FAQ system, ticket panel, and welcome messages.", "price": 120}, "tr": {"title": "Rehber Discord Botu", "desc": "Komutlar, SSS sistemi, ticket paneli ve karşılama mesajları ile bir bilgi ve rehber botu.", "price": 120}}', 1, true),
('discord', null, '{"en": {"title": "Automation Discord Bot", "desc": "An automation bot for auto-roles, scheduled messages, voice channel management, and server statistics.", "price": 120}, "tr": {"title": "Otomasyon Discord Botu", "desc": "Auto-rol, zamanlanmış mesajlar, ses kanalı yönetimi ve sunucu istatistikleri için otomasyon botu.", "price": 120}}', 2, true),
('discord', null, '{"en": {"title": "Custom System Discord Bot", "desc": "A tailor-made bot built from scratch for your unique needs — economy, leveling, custom commands, or any system you imagine.", "price": 200}, "tr": {"title": "Özel Sistem Discord Botu", "desc": "Hayal ettiğiniz her şey — ekonomi, seviye sistemi, özel komutlar veya aklınıza gelen herhangi bir sistem.", "price": 200}}', 3, true);

-- Minecraft (3)
insert into public.design_products (category, slug, data, sort_order, visible) values
('minecraft', null, '{"en": {"title": "Minecraft Text Logo", "desc": "Pixel-perfect Minecraft-style text logos with unique typography and effects."}, "tr": {"title": "Minecraft Text Logo", "desc": "Birebir pixel uyumlu, özgün tipografi ve efektlerle Minecraft tarzı text logolar."}}', 0, true),
('minecraft', null, '{"en": {"title": "Minecraft Banner Design", "desc": "Eye-catching banner designs tailored for Minecraft servers and communities."}, "tr": {"title": "Minecraft Banner Tasarımı", "desc": "Minecraft sunucuları ve toplulukları için özel olarak tasarlanmış bannerlar."}}', 1, true),
('minecraft', null, '{"en": {"title": "Minecraft Thread Design", "desc": "Custom forum thread designs specifically for Minecraft server listings."}, "tr": {"title": "Minecraft Konu Tasarımı", "desc": "Minecraft sunucu listeleri için özel forum konu tasarımları."}}', 2, true);
