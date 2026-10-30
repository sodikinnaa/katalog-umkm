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

Tambahkan bagian baru untuk setiap error yang kamu perbaiki atau fitur bonus yang kamu kerjakan.
