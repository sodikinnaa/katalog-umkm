create table if not exists public.varian_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk (id) on delete cascade,
  nama text not null,
  harga integer not null,
  stok integer not null default 0,
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  constraint varian_produk_nama_check check (char_length(btrim(nama)) between 1 and 100),
  constraint varian_produk_harga_check check (harga >= 0),
  constraint varian_produk_stok_check check (stok >= 0),
  constraint varian_produk_urutan_check check (urutan >= 0)
);

create unique index if not exists varian_produk_produk_nama_key
  on public.varian_produk (produk_id, lower(nama));
create index if not exists varian_produk_produk_aktif_urutan_idx
  on public.varian_produk (produk_id, aktif, urutan, id);

alter table public.varian_produk enable row level security;

drop policy if exists "admin_baca_varian_produk" on public.varian_produk;
drop policy if exists "admin_tambah_varian_produk" on public.varian_produk;
drop policy if exists "admin_ubah_varian_produk" on public.varian_produk;
drop policy if exists "admin_hapus_varian_produk" on public.varian_produk;

create policy "admin_baca_varian_produk" on public.varian_produk
  for select to authenticated using (true);
create policy "admin_tambah_varian_produk" on public.varian_produk
  for insert to authenticated with check (true);
create policy "admin_ubah_varian_produk" on public.varian_produk
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_varian_produk" on public.varian_produk
  for delete to authenticated using (true);
