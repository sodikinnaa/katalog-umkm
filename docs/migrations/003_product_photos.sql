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
