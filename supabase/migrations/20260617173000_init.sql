-- Parlas Dış Ticaret — başlangıç şeması
-- Kimlik doğrulama Supabase Auth (auth.users) ile yapılır.
-- Kullanıcının adı/telefonu auth user metadata içinde tutulur (ayrı tablo yok).

-- ============ ÜRÜN TALEPLERİ ============
create table if not exists public.product_requests (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  urun       text not null,
  miktar     text,
  notlar     text,
  created_at timestamptz not null default now()
);

alter table public.product_requests enable row level security;

create policy "talep_select_own" on public.product_requests
  for select to authenticated using (auth.uid() = user_id);

create policy "talep_insert_own" on public.product_requests
  for insert to authenticated with check (auth.uid() = user_id);

-- ============ ABONELİKLER ============
create table if not exists public.subscriptions (
  user_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  plan_id    text not null,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "abone_select_own" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

create policy "abone_insert_own" on public.subscriptions
  for insert to authenticated with check (auth.uid() = user_id);

create policy "abone_update_own" on public.subscriptions
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "abone_delete_own" on public.subscriptions
  for delete to authenticated using (auth.uid() = user_id);
