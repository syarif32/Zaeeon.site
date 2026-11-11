
"use client";

export default function CVPageAlert({
  pageCount,
  isId,
}: {
  pageCount: number | null;
  isId: boolean;
}) {
  // Tidak ada peringatan untuk 1–2 halaman.
  if (
    pageCount === null ||
    pageCount <= 2
  ) {
    return null;
  }

  // Untuk 3 halaman atau lebih, hanya memberi saran.
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
    >
      <p className="font-semibold">
        {isId
          ? `CV ini terdiri dari ${pageCount} halaman.`
          : `This CV has ${pageCount} pages.`}
      </p>

      <p className="mt-1 leading-relaxed">
        {isId
          ? "Untuk CV lamaran kerja, 1–2 halaman umumnya lebih ringkas. Kamu bisa memilih tata letak Ringkas atau menyunting bagian yang kurang relevan. Pratinjau dan unduhan tetap tersedia."
          : "For job applications, 1–2 pages is often a concise target. Consider Compact layout or trimming less relevant sections. Preview and downloads remain available."}
      </p>
    </div>
  );
}
