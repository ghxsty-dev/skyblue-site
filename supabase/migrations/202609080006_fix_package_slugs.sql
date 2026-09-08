-- Fix package slugs: move to data root level for reliable matching.
-- The slug was nested inside en/tr sections, causing URL mismatches.

update public.design_products set data = data || '{"slug": "corporate"}' where slug = 'corporate';
update public.design_products set data = data || '{"slug": "social-media"}' where slug = 'social-media';
update public.design_products set data = data || '{"slug": "minecraft-server"}' where slug = 'minecraft-server';
update public.design_products set data = data || '{"slug": "discord-server"}' where slug = 'discord-server';
