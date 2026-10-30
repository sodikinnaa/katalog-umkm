export default function Memuat() {
  return (
    <div role="status" aria-live="polite" className="animate-pulse py-10 sm:py-14">
      <span className="sr-only">Memuat halaman...</span>
      <div className="h-10 w-2/3 max-w-md rounded-lg bg-permukaan" />
      <div className="mt-4 h-5 w-full max-w-xl rounded bg-permukaan" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-garis bg-latar">
            <div className="aspect-square w-full bg-permukaan" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-3 w-1/3 rounded bg-permukaan" />
              <div className="h-4 w-3/4 rounded bg-permukaan" />
              <div className="h-5 w-1/2 rounded bg-permukaan" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
