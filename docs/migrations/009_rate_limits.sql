-- kunci wajib berupa hash (mis. SHA-256 dari IP + salt server), bukan IP mentah.
create table if not exists public.batas_kiriman (
  jenis text not null,
  kunci text not null,
  jendela_mulai timestamptz not null,
  jumlah integer not null default 0,
  primary key (jenis, kunci, jendela_mulai),
  constraint batas_kiriman_jenis_check check (jenis in ('ulasan', 'tanya_ai', 'klik_whatsapp')),
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
