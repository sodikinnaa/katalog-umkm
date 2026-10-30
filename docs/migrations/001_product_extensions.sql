alter table public.produk add column if not exists stok integer;
alter table public.produk add column if not exists harga_diskon integer;
alter table public.produk add column if not exists badge text;
alter table public.produk add column if not exists aktif boolean;
alter table public.produk add column if not exists urutan integer;

-- Produk lama dianggap tersedia (stok 10) agar katalog tidak langsung tampil "Habis".
update public.produk set stok = 10 where stok is null;
update public.produk set aktif = true where aktif is null;
update public.produk set urutan = 0 where urutan is null;

alter table public.produk alter column stok set default 0;
alter table public.produk alter column stok set not null;
alter table public.produk alter column aktif set default true;
alter table public.produk alter column aktif set not null;
alter table public.produk alter column urutan set default 0;
alter table public.produk alter column urutan set not null;

alter table public.produk drop constraint if exists produk_stok_check;
alter table public.produk add constraint produk_stok_check check (stok >= 0) not valid;
alter table public.produk validate constraint produk_stok_check;

alter table public.produk drop constraint if exists produk_harga_diskon_check;
alter table public.produk add constraint produk_harga_diskon_check
  check (harga_diskon is null or (harga_diskon >= 0 and harga_diskon < harga)) not valid;
alter table public.produk validate constraint produk_harga_diskon_check;

alter table public.produk drop constraint if exists produk_badge_check;
alter table public.produk add constraint produk_badge_check
  check (badge is null or char_length(btrim(badge)) between 1 and 50) not valid;
alter table public.produk validate constraint produk_badge_check;

create index if not exists produk_aktif_urutan_idx on public.produk (aktif, urutan, created_at desc);
create index if not exists produk_kategori_aktif_idx on public.produk (kategori, aktif);
create index if not exists produk_harga_idx on public.produk (harga);
create index if not exists produk_created_at_idx on public.produk (created_at desc);
