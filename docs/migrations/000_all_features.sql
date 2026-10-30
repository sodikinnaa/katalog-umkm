-- Jalankan sekali di Supabase SQL Editor. Dibuat dari migration 001-010.


-- 001_product_extensions.sql

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


-- 002_categories.sql

create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null,
  slug text,
  created_at timestamptz not null default now()
);

alter table public.kategori add column if not exists slug text;
alter table public.kategori add column if not exists created_at timestamptz not null default now();

alter table public.kategori drop constraint if exists kategori_nama_check;
alter table public.kategori add constraint kategori_nama_check
  check (char_length(nama) between 1 and 100 and nama = btrim(nama));

create unique index if not exists kategori_nama_key on public.kategori (nama);
create unique index if not exists kategori_nama_lower_key on public.kategori (lower(nama));

create or replace function public.slugify(teks text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(nullif(btrim(regexp_replace(lower(coalesce(teks, '')), '[^a-z0-9]+', '-', 'g'), '-'), ''), 'kategori');
$$;

create or replace function public.kategori_set_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.slug is null or btrim(new.slug) = ''
     or (tg_op = 'UPDATE' and new.nama is distinct from old.nama and new.slug is not distinct from old.slug) then
    new.slug := public.slugify(new.nama);
  else
    new.slug := public.slugify(new.slug);
  end if;
  if exists (select 1 from public.kategori k where k.slug = new.slug and k.id <> new.id) then
    new.slug := new.slug || '-' || new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists kategori_set_slug on public.kategori;
create trigger kategori_set_slug
  before insert or update of nama, slug on public.kategori
  for each row execute function public.kategori_set_slug();

-- Rapikan spasi dan string kosong sebelum seed dan FK.
update public.produk set kategori = nullif(btrim(kategori), '')
where kategori is not null and kategori is distinct from nullif(btrim(kategori), '');

-- Seed: satu baris per nama (tanpa beda huruf besar/kecil), pakai ejaan paling sering.
insert into public.kategori (nama)
select distinct on (lower(kategori)) kategori
from (
  select kategori, count(*) as jumlah
  from public.produk
  where kategori is not null
  group by kategori
) s
where not exists (select 1 from public.kategori k where lower(k.nama) = lower(s.kategori))
order by lower(kategori), jumlah desc, kategori;

-- Samakan ejaan produk dengan kategori terdaftar (mis. "camilan" menjadi "Camilan").
update public.produk p set kategori = k.nama
from public.kategori k
where lower(p.kategori) = lower(k.nama) and p.kategori <> k.nama;

update public.kategori set slug = null where slug is null or btrim(slug) = '';
alter table public.kategori alter column slug set not null;
create unique index if not exists kategori_slug_key on public.kategori (slug);

alter table public.produk drop constraint if exists produk_kategori_fkey;
alter table public.produk add constraint produk_kategori_fkey
  foreign key (kategori) references public.kategori (nama)
  on update cascade on delete restrict;

create index if not exists produk_kategori_idx on public.produk (kategori);

alter table public.kategori enable row level security;

drop policy if exists "admin_baca_kategori" on public.kategori;
drop policy if exists "admin_tambah_kategori" on public.kategori;
drop policy if exists "admin_ubah_kategori" on public.kategori;
drop policy if exists "admin_hapus_kategori" on public.kategori;

create policy "admin_baca_kategori" on public.kategori
  for select to authenticated using (true);
create policy "admin_tambah_kategori" on public.kategori
  for insert to authenticated with check (true);
create policy "admin_ubah_kategori" on public.kategori
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_kategori" on public.kategori
  for delete to authenticated using (true);


-- 003_product_photos.sql

create table if not exists public.foto_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk (id) on delete cascade,
  storage_path text not null,
  alt_text text,
  urutan integer not null default 0,
  created_at timestamptz not null default now(),
  constraint foto_produk_storage_path_check check (storage_path = btrim(storage_path) and storage_path <> ''),
  constraint foto_produk_urutan_check check (urutan >= 0)
);

create unique index if not exists foto_produk_storage_path_key on public.foto_produk (storage_path);
create index if not exists foto_produk_produk_urutan_idx on public.foto_produk (produk_id, urutan, id);

alter table public.foto_produk enable row level security;

drop policy if exists "admin_baca_foto_produk" on public.foto_produk;
drop policy if exists "admin_tambah_foto_produk" on public.foto_produk;
drop policy if exists "admin_ubah_foto_produk" on public.foto_produk;
drop policy if exists "admin_hapus_foto_produk" on public.foto_produk;

create policy "admin_baca_foto_produk" on public.foto_produk
  for select to authenticated using (true);
create policy "admin_tambah_foto_produk" on public.foto_produk
  for insert to authenticated with check (true);
create policy "admin_ubah_foto_produk" on public.foto_produk
  for update to authenticated using (true) with check (true);
create policy "admin_hapus_foto_produk" on public.foto_produk
  for delete to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produk', 'produk', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Bucket publik melayani URL /object/public tanpa policy select; listing objek tetap hanya untuk admin.
drop policy if exists "publik_baca_foto_produk" on storage.objects;
drop policy if exists "admin_upload_foto_produk" on storage.objects;
drop policy if exists "admin_ubah_foto_produk" on storage.objects;
drop policy if exists "admin_hapus_foto_produk" on storage.objects;
drop policy if exists "admin_baca_foto_storage" on storage.objects;
drop policy if exists "admin_tambah_foto_storage" on storage.objects;
drop policy if exists "admin_ubah_foto_storage" on storage.objects;
drop policy if exists "admin_hapus_foto_storage" on storage.objects;

create policy "admin_baca_foto_storage" on storage.objects
  for select to authenticated using (bucket_id = 'produk');
create policy "admin_tambah_foto_storage" on storage.objects
  for insert to authenticated with check (bucket_id = 'produk');
create policy "admin_ubah_foto_storage" on storage.objects
  for update to authenticated using (bucket_id = 'produk') with check (bucket_id = 'produk');
create policy "admin_hapus_foto_storage" on storage.objects
  for delete to authenticated using (bucket_id = 'produk');


-- 004_variants.sql

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


-- 005_reviews.sql

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


-- 006_whatsapp_clicks.sql

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


-- 007_store_settings.sql

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


-- 008_admin_audit.sql

create table if not exists public.admin_profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nama text,
  aktif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.log_aktivitas (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  aksi text not null,
  entitas text not null,
  entitas_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint log_aktivitas_aksi_check check (char_length(btrim(aksi)) between 1 and 50),
  constraint log_aktivitas_entitas_check check (char_length(btrim(entitas)) between 1 and 50)
);

insert into public.admin_profile (user_id, email, nama, aktif)
select id, email, coalesce(raw_user_meta_data ->> 'name', raw_user_meta_data ->> 'full_name'), true
from auth.users
on conflict (user_id) do update set email = excluded.email;

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profile
    where user_id = auth.uid() and aktif
  );
$$;

revoke all on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated;

create or replace function public.protect_own_admin_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and old.user_id = auth.uid() then
    if tg_op = 'DELETE' or not new.aktif then
      raise exception 'Admin tidak dapat menonaktifkan atau menghapus akunnya sendiri';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists admin_profile_protect_self on public.admin_profile;
create trigger admin_profile_protect_self
  before update or delete on public.admin_profile
  for each row execute function public.protect_own_admin_profile();

drop trigger if exists admin_profile_set_updated_at on public.admin_profile;
create trigger admin_profile_set_updated_at before update on public.admin_profile
  for each row execute function public.set_updated_at();

create or replace function public.audit_produk_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  insert into public.log_aktivitas (admin_id, aksi, entitas, entitas_id, detail)
  values (
    auth.uid(), lower(tg_op), 'produk', coalesce(new.id, old.id)::text,
    case when tg_op = 'DELETE' then jsonb_build_object('nama', old.nama)
         else jsonb_build_object('nama', new.nama) end
  );
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists produk_audit_changes on public.produk;
create trigger produk_audit_changes
  after insert or update or delete on public.produk
  for each row execute function public.audit_produk_changes();

create index if not exists admin_profile_aktif_idx on public.admin_profile (aktif);
create index if not exists log_aktivitas_created_idx on public.log_aktivitas (created_at desc);
create index if not exists log_aktivitas_admin_created_idx on public.log_aktivitas (admin_id, created_at desc);

alter table public.admin_profile enable row level security;
alter table public.log_aktivitas enable row level security;

drop policy if exists "admin_baca_admin_profile" on public.admin_profile;
drop policy if exists "admin_tambah_admin_profile" on public.admin_profile;
drop policy if exists "admin_ubah_admin_profile" on public.admin_profile;
drop policy if exists "admin_hapus_admin_profile" on public.admin_profile;
drop policy if exists "admin_baca_log_aktivitas" on public.log_aktivitas;
drop policy if exists "admin_tambah_log_aktivitas" on public.log_aktivitas;

create policy "admin_baca_admin_profile" on public.admin_profile
  for select to authenticated using (public.is_active_admin());
create policy "admin_tambah_admin_profile" on public.admin_profile
  for insert to authenticated with check (public.is_active_admin());
create policy "admin_ubah_admin_profile" on public.admin_profile
  for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin_hapus_admin_profile" on public.admin_profile
  for delete to authenticated using (public.is_active_admin());
create policy "admin_baca_log_aktivitas" on public.log_aktivitas
  for select to authenticated using (public.is_active_admin());
create policy "admin_tambah_log_aktivitas" on public.log_aktivitas
  for insert to authenticated with check (admin_id = auth.uid() and public.is_active_admin());

-- Setelah profil tersedia, semua mutasi admin mensyaratkan profil aktif.
drop policy if exists "admin_baca_produk" on public.produk;
drop policy if exists "admin_tambah_produk" on public.produk;
drop policy if exists "admin_ubah_produk" on public.produk;
drop policy if exists "admin_hapus_produk" on public.produk;
create policy "admin_baca_produk" on public.produk for select to authenticated using (public.is_active_admin());
create policy "admin_tambah_produk" on public.produk for insert to authenticated with check (public.is_active_admin());
create policy "admin_ubah_produk" on public.produk for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin_hapus_produk" on public.produk for delete to authenticated using (public.is_active_admin());

do $policies$
declare
  t text;
  p text;
begin
  foreach t in array array['kategori', 'foto_produk', 'varian_produk', 'banner'] loop
    foreach p in array array['baca', 'tambah', 'ubah', 'hapus'] loop
      execute format('drop policy if exists %I on public.%I', 'admin_' || p || '_' || t, t);
    end loop;
    execute format('create policy %I on public.%I for select to authenticated using (public.is_active_admin())', 'admin_baca_' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check (public.is_active_admin())', 'admin_tambah_' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin())', 'admin_ubah_' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.is_active_admin())', 'admin_hapus_' || t, t);
  end loop;
end
$policies$;

drop policy if exists "admin_baca_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_tambah_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_ubah_pengaturan_toko" on public.pengaturan_toko;
create policy "admin_baca_pengaturan_toko" on public.pengaturan_toko for select to authenticated using (public.is_active_admin());
create policy "admin_tambah_pengaturan_toko" on public.pengaturan_toko for insert to authenticated with check (id = 1 and public.is_active_admin());
create policy "admin_ubah_pengaturan_toko" on public.pengaturan_toko for update to authenticated using (id = 1 and public.is_active_admin()) with check (id = 1 and public.is_active_admin());

drop policy if exists "admin_baca_ulasan" on public.ulasan;
drop policy if exists "admin_ubah_ulasan" on public.ulasan;
drop policy if exists "admin_hapus_ulasan" on public.ulasan;
create policy "admin_baca_ulasan" on public.ulasan for select to authenticated using (public.is_active_admin());
create policy "admin_ubah_ulasan" on public.ulasan for update to authenticated using (public.is_active_admin()) with check (public.is_active_admin());
create policy "admin_hapus_ulasan" on public.ulasan for delete to authenticated using (public.is_active_admin());

drop policy if exists "admin_upload_foto_produk" on storage.objects;
drop policy if exists "admin_ubah_foto_produk" on storage.objects;
drop policy if exists "admin_hapus_foto_produk" on storage.objects;
drop policy if exists "admin_baca_foto_storage" on storage.objects;
drop policy if exists "admin_tambah_foto_storage" on storage.objects;
drop policy if exists "admin_ubah_foto_storage" on storage.objects;
drop policy if exists "admin_hapus_foto_storage" on storage.objects;
create policy "admin_baca_foto_storage" on storage.objects for select to authenticated using (bucket_id = 'produk' and public.is_active_admin());
create policy "admin_tambah_foto_storage" on storage.objects for insert to authenticated with check (bucket_id = 'produk' and public.is_active_admin());
create policy "admin_ubah_foto_storage" on storage.objects for update to authenticated using (bucket_id = 'produk' and public.is_active_admin()) with check (bucket_id = 'produk' and public.is_active_admin());
create policy "admin_hapus_foto_storage" on storage.objects for delete to authenticated using (bucket_id = 'produk' and public.is_active_admin());

drop policy if exists "admin_baca_klik_whatsapp" on public.klik_whatsapp;
drop policy if exists "admin_hapus_klik_whatsapp" on public.klik_whatsapp;
create policy "admin_baca_klik_whatsapp" on public.klik_whatsapp for select to authenticated using (public.is_active_admin());
create policy "admin_hapus_klik_whatsapp" on public.klik_whatsapp for delete to authenticated using (public.is_active_admin());


-- 009_rate_limits.sql

-- kunci wajib berupa hash (mis. SHA-256 dari IP + salt server), bukan IP mentah.
create table if not exists public.batas_kiriman (
  jenis text not null,
  kunci text not null,
  jendela_mulai timestamptz not null,
  jumlah integer not null default 0,
  primary key (jenis, kunci, jendela_mulai),
  constraint batas_kiriman_jenis_check check (jenis in ('ulasan', 'tanya_ai', 'klik_whatsapp', 'login')),
  constraint batas_kiriman_kunci_check check (kunci ~ '^[a-f0-9]{32,128}$'),
  constraint batas_kiriman_jumlah_check check (jumlah >= 0)
);

create index if not exists batas_kiriman_jendela_idx on public.batas_kiriman (jendela_mulai);

alter table public.batas_kiriman enable row level security;

create or replace function public.ambil_jatah_kiriman(
  p_jenis text,
  p_kunci text,
  p_maks integer,
  p_detik integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_jendela timestamptz;
  v_jumlah integer;
begin
  if p_maks is null or p_detik is null or p_maks < 1 or p_detik < 1 or p_detik > 86400 then
    raise exception 'Parameter batas kiriman tidak valid';
  end if;

  v_jendela := to_timestamp(floor(extract(epoch from now()) / p_detik) * p_detik);

  delete from public.batas_kiriman where jendela_mulai < now() - interval '2 days';

  insert into public.batas_kiriman as b (jenis, kunci, jendela_mulai, jumlah)
  values (p_jenis, p_kunci, v_jendela, 1)
  on conflict (jenis, kunci, jendela_mulai)
  do update set jumlah = b.jumlah + 1
  where b.jumlah < p_maks
  returning jumlah into v_jumlah;

  return v_jumlah is not null;
end;
$$;

revoke all on table public.batas_kiriman from anon, authenticated;
revoke all on function public.ambil_jatah_kiriman(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.ambil_jatah_kiriman(text, text, integer, integer) to service_role;


-- 010_login_rate_limit.sql

alter table public.batas_kiriman drop constraint if exists batas_kiriman_jenis_check;
alter table public.batas_kiriman add constraint batas_kiriman_jenis_check check (jenis in ('ulasan', 'tanya_ai', 'klik_whatsapp', 'login'));
