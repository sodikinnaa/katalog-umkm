import Tombol from "@/components/Tombol";

function buatHref(searchParams, halaman) {
  const params = new URLSearchParams();

  for (const nama of ["q", "kategori", "urut"]) {
    if (searchParams[nama]) params.set(nama, searchParams[nama]);
  }

  if (halaman > 1) params.set("halaman", String(halaman));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function Paginasi({ halaman, jumlahHalaman, searchParams }) {
  if (jumlahHalaman <= 1) return null;

  return (
    <nav aria-label="Paginasi produk" className="flex items-center justify-between gap-4">
      {halaman > 1 ? (
        <Tombol href={buatHref(searchParams, halaman - 1)} varian="garis">
          Sebelumnya
        </Tombol>
      ) : (
        <span />
      )}
      <p className="text-sm text-teks-lembut">
        Halaman {halaman} dari {jumlahHalaman}
      </p>
      {halaman < jumlahHalaman ? (
        <Tombol href={buatHref(searchParams, halaman + 1)} varian="garis">
          Berikutnya
        </Tombol>
      ) : (
        <span />
      )}
    </nav>
  );
}
