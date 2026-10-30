create table if not exists public.banner (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text,
  tautan text,
  aktif boolean not null default true,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banner_judul_check check (char_length(btrim(judul)) between 1 and 120),
  constraint banner_urutan_check check (urutan >= 0)
);

create table if not exists public.pengaturan_toko (
  id smallint primary key default 1,
  nama text not null,
  tagline text,
  nomor_whatsapp text not null,
  alamat text not null,
  jam_buka text not null,
  updated_at timestamptz not null default now(),
  constraint pengaturan_toko_singleton_check check (id = 1),
  constraint pengaturan_toko_nama_check check (char_length(btrim(nama)) between 1 and 100),
  constraint pengaturan_toko_whatsapp_check check (nomor_whatsapp ~ '^[1-9][0-9]{7,14}$')
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists banner_set_updated_at on public.banner;
create trigger banner_set_updated_at before update on public.banner
  for each row execute function public.set_updated_at();

drop trigger if exists pengaturan_toko_set_updated_at on public.pengaturan_toko;
create trigger pengaturan_toko_set_updated_at before update on public.pengaturan_toko
  for each row execute function public.set_updated_at();

insert into public.pengaturan_toko (id, nama, tagline, nomor_whatsapp, alamat, jam_buka)
values (
  1,
  'E-Craf UMKM',
  'Produk rumahan dari dapur dan perajin lokal, siap dipesan lewat WhatsApp.',
  '6288275426716',
  'Indonesia',
  'Setiap hari, 08.00–20.00'
)
on conflict (id) do nothing;

create index if not exists banner_aktif_urutan_idx on public.banner (aktif, urutan, id);

alter table public.banner enable row level security;
alter table public.pengaturan_toko enable row level security;

drop policy if exists "admin_baca_banner" on public.banner;
drop policy if exists "admin_tambah_banner" on public.banner;
drop policy if exists "admin_ubah_banner" on public.banner;
drop policy if exists "admin_hapus_banner" on public.banner;
drop policy if exists "admin_baca_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_tambah_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_ubah_pengaturan_toko" on public.pengaturan_toko;

create policy "admin_baca_banner" on public.banner for select to authenticated using (true);
create policy "admin_tambah_banner" on public.banner for insert to authenticated with check (true);
create policy "admin_ubah_banner" on public.banner for update to authenticated using (true) with check (true);
create policy "admin_hapus_banner" on public.banner for delete to authenticated using (true);
create policy "admin_baca_pengaturan_toko" on public.pengaturan_toko for select to authenticated using (true);
create policy "admin_tambah_pengaturan_toko" on public.pengaturan_toko
  for insert to authenticated with check (id = 1);
create policy "admin_ubah_pengaturan_toko" on public.pengaturan_toko
  for update to authenticated using (id = 1) with check (id = 1);
