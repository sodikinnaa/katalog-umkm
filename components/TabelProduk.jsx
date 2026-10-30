import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import TombolHapusProduk from "@/components/TombolHapusProduk";
import { aturAktifProduk, geserProduk } from "@/app/admin/actions";

function TombolAksi({ action, fields, varian = "garis", children, ...props }) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([name, value]) => <input key={name} type="hidden" name={name} value={value} />)}
      <Tombol type="submit" varian={varian} {...props}>{children}</Tombol>
    </form>
  );
}

export default function TabelProduk({ daftarProduk }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Urutan</th>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold"><span className="sr-only">Aksi</span></th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className={`border-t border-garis ${produk.aktif === false ? "opacity-60" : ""}`}>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <TombolAksi action={geserProduk} fields={{ id: produk.id, arah: "naik" }} aria-label={`Naikkan ${produk.nama}`} className="px-2">↑</TombolAksi>
                  <TombolAksi action={geserProduk} fields={{ id: produk.id, arah: "turun" }} aria-label={`Turunkan ${produk.nama}`} className="px-2">↓</TombolAksi>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={produk.foto_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span className="font-semibold">{produk.nama}</span>
                  {produk.badge && <span className="rounded-md bg-permukaan px-2 py-0.5 text-xs font-semibold">{produk.badge}</span>}
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">
                {produk.harga_diskon != null ? (
                  <span className="flex flex-col"><span className="font-semibold">{formatRupiah(produk.harga_diskon)}</span><s className="text-xs text-teks-lembut">{formatRupiah(produk.harga)}</s></span>
                ) : formatRupiah(produk.harga)}
              </td>
              <td className="px-4 py-3">{Number(produk.stok ?? 0) <= 0 ? <span className="font-semibold text-bahaya">Habis</span> : produk.stok}</td>
              <td className="px-4 py-3">
                <TombolAksi action={aturAktifProduk} fields={{ id: produk.id, aktif: produk.aktif === false ? "true" : "false" }}>
                  {produk.aktif === false ? "Aktifkan" : "Nonaktifkan"}
                </TombolAksi>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">Ubah</Tombol>
                  <Tombol href={`/admin/produk/${produk.id}/varian`} varian="garis">Varian</Tombol>
                  <TombolHapusProduk id={produk.id} nama={produk.nama} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
