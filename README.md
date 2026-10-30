# Katalog UMKM + Order WhatsApp

Template workshop vibe coding Creative Hub App Talent (CHAT) 2026. Repo ini berisi tampilan aplikasi katalog UMKM; tugasmu merangkainya menjadi sistem utuh dengan bantuan AI: database, login admin, keamanan, dan pemesanan lewat WhatsApp.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fandixurniawan%2Fkatalog-umkm&project-name=katalog-umkm&repository-name=katalog-umkm)

## Langkah awal

1. **Salin repo ke akun GitHub-mu.** Klik tombol **Deploy with Vercel** di atas. Vercel akan membuat repo baru di akun GitHub-mu dan langsung men-deploy-nya. Setelah selesai, buka link Vercel-mu: katalog tampil dengan data contoh.
2. **Buat proyek Supabase.** Masuk ke [supabase.com](https://supabase.com) dengan akun GitHub, lalu buat proyek baru. Simpan password database di tempat aman.
3. **Siapkan database.** Di Supabase, buka **SQL Editor**, tempel seluruh isi `docs/schema.sql`, lalu klik **Run**. Tabel `produk` beserta data awal akan terbentuk.
4. **Siapkan akun admin.** Ikuti panduan akun admin yang dibagikan mentor. Setelah itu matikan pendaftaran akun baru di **Authentication > Sign In / Providers**.
5. **Isi environment variable di Vercel.** Buka proyekmu di Vercel > **Settings > Environment Variables**, lalu isi tiga variabel dari `.env.example`. Nilainya ada di Supabase > **Project Settings > API**. Setelah itu lakukan **Redeploy**.
6. **Clone repo ke laptop.**

   ```bash
   git clone https://github.com/<akunmu>/<nama-repo>.git
   cd <nama-repo>
   npm install
   ```

7. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi dengan nilai yang sama seperti di Vercel.
8. **Jalankan di laptop.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Alur kerja

Kerjakan satu user story setiap kali, lalu simpan dan kirim perubahan:

```bash
git add .
git commit -m "US-01: katalog dari database"
git push
```

Setiap `git push`, Vercel otomatis men-deploy versi terbaru. Cek hasilnya di link Vercel-mu.

Urutan yang disarankan: US-01, US-02, US-03, US-04, US-05, US-06, lalu fitur bonus. Daftar lengkap ada di `docs/user-stories.md`.

## Isi repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt, wajib diisi |
| `docs/` | Problem statement, PRD, user story, rancangan teknis, skema database, checklist |
| `lib/toko.js` | Nama toko, nomor WhatsApp, alamat, jam buka |
| `app/` | Halaman aplikasi |
| `components/` | Komponen tampilan |

## Menyesuaikan dengan usahamu

- Identitas toko: ubah `lib/toko.js`.
- Warna: ubah bagian `@theme` di `app/globals.css` (lihat `DESIGN.md`).
- Produk: ubah langsung di Supabase > **Table Editor > produk**.

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Isi `PROMPTS.md` setiap menyelesaikan fitur.

## Sebelum mengumpulkan

1. Jalankan semua poin di `docs/checklist-keamanan.md` dan `docs/checklist-pengujian.md` pada link Vercel.
2. Lengkapi bagian di bawah ini.
3. Push perubahan terakhir sebelum batas waktu.

## Migrasi fitur lanjutan

Fitur bonus US-18 sampai US-48 membutuhkan tabel tambahan. Jalankan `docs/migrations/000_all_features.sql` sekali di Supabase SQL Editor, atau file `001` sampai `009` secara berurutan. Penjelasan dan SQL verifikasi ada di `docs/migrations/README.md`.

Variabel tambahan untuk fitur AI (US-14 dan US-50): `ENDPOINT`, `API_KEY`, dan `AI_MODEL` (lihat `.env.example`). Semuanya hanya dipakai di server.

## Tentang aplikasi ini

- **Nama usaha:** E-Craf UMKM
- **Pembuat:** Sodikin
- **Link aplikasi:** https://katalog-umkm-sodikina.vercel.app
- **Katalog produk aktif:** 61 produk dalam 7 kategori (Bumbu, Camilan, Kain, Kerajinan, Kue kering, Minuman, dan kategori kustom) dengan 60 foto produk yang di-host di Supabase Storage publik.
- **Pemesanan:** Langsung via tautan WhatsApp resmi dengan pesan otomatis yang merangkum nama produk, varian, jumlah, dan total harga.
- **Fitur wajib (US-01 sampai US-06):** Katalog dari Supabase server-side, detail produk dinamis, tombol pesan WhatsApp, login admin berbasis cookie dan Supabase Auth, ganti password admin dengan validasi server, serta proteksi seluruh rute admin via `proxy.js`.
- **Fitur bonus (US-07 sampai US-50):**
  - **Katalog & Navigasi:** Pencarian nama, filter kategori, urutan harga/terbaru, paginasi publik, halaman detail produk terkait, varian produk, galeri foto, status stok, harga coret, badge, halaman per kategori (`/kategori/[slug]`), keranjang belanja dengan pesan massal WhatsApp, perbandingan dua produk berdampingan, produk terakhir dilihat, dan daftar produk favorit (tersimpan di browser).
  - **Tampilan & Aksesibilitas:** Desain responsif, navigasi mobile burger bar, tombol toggle mode gelap/terang berikon SVG matahari dan bulan, PWA dengan manifest dan app icon, serta chatbot asisten AI melayang di kanan bawah untuk tanya jawab katalog.
  - **Manajemen Admin:** Dashboard ringkasan total dan per-kategori, daftar produk terlaris berdasarkan klik WhatsApp, CRUD produk dengan validasi form server dan upload foto ke Supabase Storage, toggle aktif/nonaktif produk, pengatur urutan tampil, kelola kategori dengan proteksi relasi, kelola akun admin (tambah, aktifkan, nonaktifkan, hapus), audit log aktivitas 50 aksi terakhir, ekspor katalog ke CSV, impor massal produk via CSV dengan validasi baris, moderasi ulasan pembeli, banner promosi beranda, dan pengaturan identitas toko.
  - **Keamanan & Kepatuhan:** Content-Security-Policy ketat, header `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `X-Robots-Tag: noindex, nofollow` dan robots disallow untuk area `/admin`, sanitasi parameter query pencarian, rate-limit berbasis token bucket server pada tanya AI dan form login (fallback in-memory dan database), halaman error ramah pengguna tanpa kebocoran stack trace, serta dependensi bersih dari kerentanan kritis.
