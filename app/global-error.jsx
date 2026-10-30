"use client";

export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body>
        <main>
          <h1>Terjadi kesalahan</h1>
          <p>Terjadi kesalahan. Silakan coba lagi.</p>
          <button onClick={reset} type="button">
            Coba lagi
          </button>
          <a href="/">Kembali ke beranda</a>
        </main>
      </body>
    </html>
  );
}
