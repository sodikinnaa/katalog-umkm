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
