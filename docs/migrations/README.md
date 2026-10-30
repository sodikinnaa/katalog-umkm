# Migrasi fitur lanjutan

Migrasi ini melengkapi kebutuhan database US-18 sampai US-48 tanpa mengubah `docs/schema.sql`. Jalankan melalui Supabase SQL Editor sebagai pemilik proyek. Setiap file aman dijalankan ulang dan urutannya wajib dipertahankan karena ada foreign key, view, trigger, dan policy yang saling bergantung.

## Urutan eksekusi

1. Jalankan `docs/schema.sql` jika skema dasar belum ada.
2. `001_product_extensions.sql`
3. `002_categories.sql`
4. `003_product_photos.sql`
5. `004_variants.sql`
6. `005_reviews.sql`
7. `006_whatsapp_clicks.sql`
8. `007_store_settings.sql`
9. `008_admin_audit.sql`
10. `009_rate_limits.sql`

Jangan menjalankan file berikutnya jika file sebelumnya gagal. Migrasi tidak menghapus kolom atau data lama. Nilai baru untuk data produk lama: `stok = 10`, `aktif = true`, dan `urutan = 0`.

## Model akses

- Tabel aplikasi tidak memiliki policy `anon`. Pembacaan publik tetap dilakukan oleh kode server memakai `SUPABASE_SECRET_KEY`, sesuai arsitektur proyek.
- Pengguna `authenticated` hanya dapat mengakses data admin setelah `008_admin_audit.sql` memastikan akun ada dan aktif di `admin_profile`.
- Ulasan, klik WhatsApp, dan rate limit publik harus ditulis melalui Server Action/Route Handler memakai koneksi server. Jangan mengekspos kunci rahasia ke browser.
- Bucket `produk` bersifat publik agar URL gambar dapat dirender. Listing dan mutasi objek dibatasi ke admin aktif. Simpan path objek di `foto_produk.storage_path`, bukan URL bertanda tangan.
- `batas_kiriman.kunci` harus berisi hash satu arah dari identitas rate-limit dan salt server; jangan simpan IP mentah.

## Verifikasi

Jalankan setelah semua migrasi selesai:

```sql
-- Kolom ekstensi produk.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'produk'
  and column_name in ('stok', 'harga_diskon', 'badge', 'aktif', 'urutan')
order by column_name;

-- Semua tabel baru tersedia dan RLS aktif.
select c.relname as tabel, c.relrowsecurity as rls_aktif
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'kategori', 'foto_produk', 'varian_produk', 'ulasan', 'klik_whatsapp',
    'banner', 'pengaturan_toko', 'admin_profile', 'log_aktivitas', 'batas_kiriman'
  )
order by c.relname;

-- FK kategori dan FK fitur produk.
select tc.table_name, tc.constraint_name, kcu.column_name,
       ccu.table_name as tabel_tujuan, ccu.column_name as kolom_tujuan,
       rc.update_rule, rc.delete_rule
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on kcu.constraint_schema = tc.constraint_schema
 and kcu.constraint_name = tc.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_schema = tc.constraint_schema
 and ccu.constraint_name = tc.constraint_name
join information_schema.referential_constraints rc
  on rc.constraint_schema = tc.constraint_schema
 and rc.constraint_name = tc.constraint_name
where tc.constraint_schema = 'public'
  and tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name in ('produk', 'foto_produk', 'varian_produk', 'ulasan', 'klik_whatsapp')
order by tc.table_name, tc.constraint_name;

-- Kategori sudah mencakup seluruh nilai produk.
select p.kategori, count(*)
from public.produk p
left join public.kategori k on k.nama = p.kategori
where p.kategori is not null and k.id is null
group by p.kategori;
-- Hasil harus 0 baris.

-- Seed singleton toko sesuai lib/toko.js saat migrasi dibuat.
select * from public.pengaturan_toko where id = 1;

-- Semua pengguna Auth awal menjadi admin aktif.
select count(*) as auth_users from auth.users;
select count(*) filter (where aktif) as admin_aktif from public.admin_profile;
-- Kedua angka harus sama segera setelah migrasi awal.

-- Bucket dan batas upload.
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'produk';

-- Daftar policy untuk audit manual; anon tidak boleh muncul pada tabel aplikasi.
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
  and tablename in (
    'produk', 'kategori', 'foto_produk', 'varian_produk', 'ulasan',
    'klik_whatsapp', 'banner', 'pengaturan_toko', 'admin_profile',
    'log_aktivitas', 'batas_kiriman', 'objects'
  )
order by schemaname, tablename, policyname;

-- View ringkasan tersedia.
select * from public.ringkasan_rating limit 1;
select * from public.produk_terlaris order by jumlah_klik desc limit 5;

-- Uji rate limit dalam transaksi agar tidak meninggalkan data.
begin;
select public.ambil_jatah_kiriman('ulasan', repeat('a', 64), 2, 60); -- true
select public.ambil_jatah_kiriman('ulasan', repeat('a', 64), 2, 60); -- true
select public.ambil_jatah_kiriman('ulasan', repeat('a', 64), 2, 60); -- false
rollback;
```

Pemanggilan fungsi rate limit di SQL Editor berjalan sebagai pemilik database. Dalam aplikasi, fungsi hanya diberikan kepada `service_role`.

## Cakupan dan caveat

- US-21, US-22 sampai US-30, US-33 sampai US-37, dan US-46 tidak memerlukan tabel tambahan di luar struktur ini; fiturnya memakai browser, query, metadata, Storage, atau tabel `produk` yang ada.
- `foto_url` lama tetap dipertahankan sebagai foto utama/cadangan. Migrasi tidak menyalin URL lama ke `foto_produk` karena `storage_path` khusus objek bucket Supabase.
- `stok` produk lama menjadi `10` agar katalog tetap bisa dipesan; admin dapat menyesuaikan stok tiap produk.
- `008_admin_audit.sql` memasukkan seluruh pengguna Auth yang sudah ada sebagai admin aktif. Pengguna Auth yang dibuat setelah migrasi harus ditambahkan ke `admin_profile` oleh alur admin server yang memakai Admin API.
- Penghapusan akun Auth bukan tanggung jawab foreign key atau RLS; lakukan lewat Supabase Admin API setelah validasi bahwa target bukan akun sendiri.
- Trigger audit otomatis mencatat perubahan `produk`. Perubahan entitas lain dapat dicatat dari Server Action ke `log_aktivitas` dengan `admin_id = auth.uid()`.
- Menjalankan ulang `008_admin_audit.sql` juga menjadikan pengguna Auth baru sebagai admin aktif. Jalankan ulang hanya jika memang diinginkan.
- Menjalankan ulang `docs/schema.sql` mengembalikan policy `produk` ke `using (true)`. Setelah itu, jalankan ulang `008_admin_audit.sql`.
- Policy Storage membutuhkan izin pemilik proyek di SQL Editor. Jika Supabase menolak `create policy` pada `storage.objects`, buat policy yang sama melalui dashboard Storage.
- Rate limit bersifat fixed-window dan pembersihannya oportunistik saat fungsi dipanggil. Tambahkan job terjadwal hanya jika volume tabel membesar.
