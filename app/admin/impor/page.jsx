import NavAdmin from "@/components/NavAdmin";
import FormImporCsv from "@/components/FormImporCsv";
import { imporCsv } from "@/app/admin/impor/actions";

export default function HalamanImporProduk() {
  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Impor produk dari CSV</h1>
        <p className="mt-1 max-w-prose text-sm text-teks-lembut">
          Unggah daftar produk sekaligus. Baris valid akan disimpan; baris yang salah akan dilewati dan dijelaskan di hasil impor.
        </p>
      </div>
      <FormImporCsv action={imporCsv} />
    </div>
  );
}
