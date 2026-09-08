-- Hassas admin işlemleri (şifre sıfırlama, e-posta değiştirme vb.) için denetim kaydı.
-- Yalnızca service_role anahtarıyla yazılır/okunur (RLS'yi atlar); herkese açık politika yok.
create table if not exists public.admin_audit_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid not null,
  target_user_id uuid,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

create index if not exists admin_audit_logs_target_idx
  on public.admin_audit_logs (target_user_id, created_at desc);
create index if not exists admin_audit_logs_admin_idx
  on public.admin_audit_logs (admin_id, created_at desc);
