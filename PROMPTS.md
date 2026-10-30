# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan. Beri tanda **[SENDIRI]** untuk prompt yang kamu tulis sendiri (bukan dari lembar kerja).

## US-01 Katalog dari database

**Prompt:** [SENDIRI] Bantu selesaikan US-01 sampai US-06.

**Hasil:** Katalog `/` mengambil produk dari tabel `produk` di Server Component memakai koneksi Supabase server. Halaman menampilkan pesan jika produk kosong.

**Perbaikan:** Menghapus data contoh dan `CatatanBelumAktif` dari katalog.

## US-02 Detail produk

**Prompt:** [SENDIRI] Bantu selesaikan US-01 sampai US-06.

**Hasil:** `/produk/[id]` mengambil satu produk dari database berdasarkan `id`. Produk yang tidak ada memanggil `notFound()`.

**Perbaikan:** Menghapus data contoh dan catatan US-03 dari halaman detail.

## US-03 Pesan via WhatsApp

**Prompt:** [SENDIRI] Pakai nomor WhatsApp 088275426716.

**Hasil:** Tombol membuka `wa.me` ke nomor di `lib/toko.js` dengan pesan berisi nama dan harga produk.

**Perbaikan:** Nomor disimpan dalam format internasional `6288275426716`.

## US-04 Login admin

**Prompt:** [SENDIRI] Bantu selesaikan US-01 sampai US-06.

**Hasil:** Login dan keluar memakai Supabase Auth melalui Server Action dan cookie `@supabase/ssr`.

**Perbaikan:** Login gagal menampilkan pesan yang jelas.

## US-05 Ganti password

**Prompt:** [SENDIRI] Bantu selesaikan US-01 sampai US-06.

**Hasil:** Admin yang sudah login dapat mengganti password. Server memvalidasi minimal 8 karakter dan konfirmasi password.

**Perbaikan:** Menampilkan pesan berhasil atau error di halaman.

## US-06 Proteksi halaman admin

**Prompt:** [SENDIRI] Bantu selesaikan US-01 sampai US-06.

**Hasil:** `proxy.js` mengalihkan semua `/admin` kecuali `/admin/login` ke halaman login jika belum masuk.

**Perbaikan:** Aksi ganti password juga memeriksa login di server.

## Debugging dan fitur bonus

### US-07 List Produk Admin dari Database
**Prompt:** [SENDIRI] Implementasikan US-07 list produk di admin dari database Supabase.
**Hasil:** Halaman `/admin` mengambil daftar produk riil dari tabel `produk` Supabase secara server-side dan menghapus dependensi pada `data-contoh.js`.
**Perbaikan:** Menghapus komponen `CatatanBelumAktif` dan mengganti data contoh dengan query dinamis database.

### US-08 Tambah Produk
**Prompt:** [SENDIRI] Implementasikan US-08 tambah produk di admin dengan proteksi auth server.
**Hasil:** Halaman `/admin/produk/baru` memproses form penambahan produk ke database Supabase melalui Server Action `tambahProduk` yang terproteksi auth admin.
**Perbaikan:** Memberikan validasi nama dan harga positif serta pesan error jika input invalid.

### US-09 Ubah Produk
**Prompt:** [SENDIRI] Implementasikan US-09 ubah produk di admin.
**Hasil:** Halaman `/admin/produk/[id]/ubah` mengambil data lama dari Supabase dan menyimpan perubahannya melalui Server Action `ubahProduk`.
**Perbaikan:** Melakukan bind ID produk ke Server Action dan merevalidasi cache halaman setelah perubahan berhasil.

### US-10 Hapus Produk
**Prompt:** [SENDIRI] Implementasikan US-10 hapus produk dengan konfirmasi.
**Hasil:** Menambahkan tombol hapus dengan konfirmasi dialog browser di tabel produk admin yang mengeksekusi Server Action `hapusProduk`.
**Perbaikan:** Aksi hapus terlindungi sesi admin dan langsung memperbarui tampilan tabel setelah dihapus.

### US-11, US-15, US-16 Filter, urutan, paginasi katalog
**Prompt:** [SENDIRI] Kerjakan US-11, US-15, dan US-16 sekaligus di katalog publik.
**Hasil:** Katalog punya pencarian nama, filter kategori, urutan termurah/termahal/terbaru, dan paginasi 12 produk per halaman. Semua diterapkan di query Supabase dan tersimpan di URL.
**Perbaikan:** Karakter khusus pencarian di-escape agar query aman; halaman di luar batas diarahkan ke halaman terakhir.

### US-12 dan US-26 Jumlah pesanan dan metadata produk
**Prompt:** [SENDIRI] Kerjakan US-12 dan US-26 di halaman detail produk.
**Hasil:** Pengunjung memilih jumlah 1–99; pesan WhatsApp memuat jumlah dan total harga. Halaman detail memakai `generateMetadata` dengan judul, deskripsi, dan Open Graph foto produk.
**Perbaikan:** Menambahkan `metadataBase` di layout agar URL gambar Open Graph memakai domain asli.

### US-22, US-27, US-28 Halaman Tentang, sitemap, loading
**Prompt:** [SENDIRI] Kerjakan US-22, US-27, dan US-28.
**Hasil:** Halaman `/tentang` berisi profil, alamat, jam buka, dan kontak WhatsApp, tertaut dari footer. `sitemap.xml` dibuat dari database, `robots.txt` menunjuk ke sitemap, dan ada skeleton `loading.jsx`.
**Perbaikan:** `/admin/` dikecualikan dari robots.

### US-30, US-33, US-35 Dashboard, cari admin, ekspor CSV
**Prompt:** [SENDIRI] Kerjakan US-30, US-33, dan US-35 di halaman admin.
**Hasil:** `/admin` menampilkan total produk dan jumlah per kategori, kolom cari dengan paginasi 20 per halaman di URL, serta tombol Ekspor CSV yang dibuat di server.
**Perbaikan:** Endpoint ekspor memeriksa login sendiri (401 tanpa sesi) dan sel CSV di-escape termasuk perlindungan formula spreadsheet.

### US-34 Validasi form admin di server
**Prompt:** [SENDIRI] Kerjakan US-34 validasi form admin di server.
**Hasil:** Server Action tambah dan ubah produk memvalidasi nama wajib dan harga bilangan bulat positif. Error tampil di bawah field yang salah.
**Perbaikan:** Nilai yang sudah diisi dipertahankan saat validasi gagal.

### US-13 PWA
**Prompt:** [SENDIRI] Kerjakan US-13 PWA.
**Hasil:** Menambahkan web app manifest dengan ikon 192 dan 512 dari `public/icons`, tautan manifest, theme color, dan metadata Apple web app.
**Perbaikan:** Memakai fitur bawaan Next.js `app/manifest.js` tanpa paket tambahan.
