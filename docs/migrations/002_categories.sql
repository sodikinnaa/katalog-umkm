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
