-- Tanpa IP, user agent, atau identitas pengunjung.
create table if not exists public.klik_whatsapp (
  id bigint generated always as identity primary key,
  produk_id bigint references public.produk (id) on delete set null,
  varian_id bigint references public.varian_produk (id) on delete set null,
  jumlah integer not null default 1,
  sumber text not null default 'detail',
  created_at timestamptz not null default now(),
  constraint klik_whatsapp_jumlah_check check (jumlah between 1 and 999),
  constraint klik_whatsapp_sumber_check check (sumber in ('detail', 'kartu', 'keranjang'))
);

create index if not exists klik_whatsapp_produk_created_idx on public.klik_whatsapp (produk_id, created_at desc);
create index if not exists klik_whatsapp_created_at_idx on public.klik_whatsapp (created_at desc);

create or replace view public.produk_terlaris
with (security_invoker = true)
as
select k.produk_id, p.nama, count(*)::integer as jumlah_klik, max(k.created_at) as klik_terakhir
from public.klik_whatsapp k
join public.produk p on p.id = k.produk_id
group by k.produk_id, p.nama;

alter table public.klik_whatsapp enable row level security;

drop policy if exists "admin_baca_klik_whatsapp" on public.klik_whatsapp;
drop policy if exists "admin_hapus_klik_whatsapp" on public.klik_whatsapp;

-- Klik ditulis server dengan kunci rahasia; admin hanya membaca dan membersihkan.
create policy "admin_baca_klik_whatsapp" on public.klik_whatsapp
  for select to authenticated using (true);
create policy "admin_hapus_klik_whatsapp" on public.klik_whatsapp
  for delete to authenticated using (true);

revoke all on public.produk_terlaris from anon;
