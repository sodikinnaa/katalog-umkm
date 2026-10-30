create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk (id) on delete cascade,
  nama text not null,
  rating smallint not null,
  komentar text not null,
  tampil boolean not null default true,
  created_at timestamptz not null default now(),
  constraint ulasan_nama_check check (char_length(btrim(nama)) between 1 and 60),
  constraint ulasan_rating_check check (rating between 1 and 5),
  constraint ulasan_komentar_check check (char_length(btrim(komentar)) between 1 and 1000)
);

create index if not exists ulasan_produk_tampil_created_idx
  on public.ulasan (produk_id, tampil, created_at desc);
create index if not exists ulasan_created_at_idx on public.ulasan (created_at desc);

create or replace view public.ringkasan_rating
with (security_invoker = true)
as
select produk_id, count(*)::integer as jumlah, round(avg(rating)::numeric, 1) as rata_rata
from public.ulasan
where tampil
group by produk_id;

alter table public.ulasan enable row level security;

drop policy if exists "admin_baca_ulasan" on public.ulasan;
drop policy if exists "admin_ubah_ulasan" on public.ulasan;
drop policy if exists "admin_hapus_ulasan" on public.ulasan;

-- Ulasan publik ditulis server dengan kunci rahasia; tidak ada policy anon atau insert.
create policy "admin_baca_ulasan" on public.ulasan
  for select to authenticated using (true);
create policy "admin_ubah_ulasan" on public.ulasan
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_ulasan" on public.ulasan
  for delete to authenticated using (true);

revoke all on public.ringkasan_rating from anon;
