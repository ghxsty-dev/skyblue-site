-- Kaldirilan AI kotasi tablosu + kaldirilan fontlari secen kayitlar + simge zemini.
drop table if exists public.rank_ai_usage;

update public.rank_projects
set font_id = 'block',
    updated_at = now()
where font_id in ('visitor', 'datcub', 'chlorenuf');

-- Simge zemini: 'same' (metinle ayni) | 'transparent' (saydam) | '#rrggbb'.
alter table public.rank_projects
  add column if not exists icon_bg_left text not null default 'same';

alter table public.rank_projects
  add column if not exists icon_bg_right text not null default 'same';

alter table public.rank_projects
  drop constraint if exists rank_projects_icon_bg_check;

alter table public.rank_projects
  add constraint rank_projects_icon_bg_check check (
    (icon_bg_left in ('same', 'transparent') or icon_bg_left ~ '^#[0-9a-f]{6}$') and
    (icon_bg_right in ('same', 'transparent') or icon_bg_right ~ '^#[0-9a-f]{6}$')
  );
