alter table public.batas_kiriman drop constraint if exists batas_kiriman_jenis_check;
alter table public.batas_kiriman add constraint batas_kiriman_jenis_check check (jenis in ('ulasan', 'tanya_ai', 'klik_whatsapp', 'login'));
