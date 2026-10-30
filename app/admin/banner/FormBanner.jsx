import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

export default function FormBanner({ banner = {}, action, labelTombol, batalHref = "/admin/banner" }) {
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <Input label="Judul" name="judul" defaultValue={banner.judul} maxLength={120} required />
      <Input label="Teks" name="teks" textarea defaultValue={banner.teks ?? ""} maxLength={500} />
      <Input
        label="Link gambar"
        name="gambar_url"
        defaultValue={banner.gambar_url ?? ""}
        placeholder="https://... (boleh kosong)"
      />
      <Input
        label="Tautan tujuan"
        name="tautan"
        defaultValue={banner.tautan ?? ""}
        placeholder="https://... atau /produk/123 (boleh kosong)"
      />
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href={batalHref} varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
