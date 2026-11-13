
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  blob: Blob;
  zoom?: number;
  isId: boolean;
  onPageCount?: (count: number) => void;
  documentLabel?: string;
};

export default function PDFCanvasPreview({
  blob,
  zoom = 1,
  isId,
  onPageCount,
  documentLabel = "CV",
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => {
  const actualWidth = Math.floor(
    host.getBoundingClientRect().width
  );

  // jangan render saat container tersembunyi
  if (actualWidth < 100) return;

  const nextWidth = Math.max(
    160,
    actualWidth - 24
  );

  // hindari render ulang untuk perubahan ukuran sangat kecil
  setContainerWidth((previous) => {
    return Math.abs(previous - nextWidth) >= 16
      ? nextWidth
      : previous;
  });
};

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !containerWidth) return;

    let cancelled = false;

    let loadingTask: {
      destroy: () => Promise<void>;
    } | null = null;

    const renderTasks: {
      cancel: () => void;
    }[] = [];

    host.replaceChildren();

    setLoading(true);
    setError(false);

    async function renderPdf() {
      try {
        // ambil pdf.js dari folder public, bukan bundle webpack
        const assetBase =
          `${window.location.origin}/pdfjs/v5.4.624`;

        const pdfjsModuleUrl =
          `${assetBase}/pdf.min.mjs`;

        const pdfjs = (await import(
          /* webpackIgnore: true */ pdfjsModuleUrl
        )) as typeof import("pdfjs-dist");

        // worker dan library wajib menggunakan versi yang sama
        pdfjs.GlobalWorkerOptions.workerSrc =
          `${assetBase}/pdf.worker.min.mjs`;

        const bytes = new Uint8Array(
          await blob.arrayBuffer()
        );

        if (cancelled) return;

        const task = pdfjs.getDocument({
          data: bytes,
        });

        loadingTask = task;

        const pdfDocument = await task.promise;

        if (cancelled) return;

        onPageCount?.(pdfDocument.numPages);

        // batasi jumlah halaman untuk menjaga performa hp
        const pagesToDraw = Math.min(
          pdfDocument.numPages,
          12
        );

        const targetWidth =
          Math.min(containerWidth, 820) * zoom;

        const pixelRatio = Math.min(
  window.devicePixelRatio || 1,
  1.25
);

        for (
          let index = 1;
          index <= pagesToDraw;
          index++
        ) {
          if (cancelled) return;

          const page = await pdfDocument.getPage(index);

          const baseViewport = page.getViewport({
            scale: 1,
          });

          const scale =
            targetWidth / baseViewport.width;

          const viewport = page.getViewport({
            scale: scale * pixelRatio,
          });

          const canvas =
            document.createElement("canvas");

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          canvas.style.width =
            `${Math.ceil(targetWidth)}px`;

          canvas.style.height =
            `${Math.ceil(baseViewport.height * scale)}px`;

          canvas.style.display = "block";
          canvas.style.backgroundColor = "#ffffff";

          canvas.setAttribute(
            "aria-label",
            `${documentLabel} page ${index}`
          );

          const pageWrapper =
            document.createElement("div");

          pageWrapper.style.width = "max-content";
          pageWrapper.style.margin = "0 auto 16px";
          pageWrapper.style.boxShadow =
            "0 4px 20px rgba(0,0,0,0.15)";

          pageWrapper.appendChild(canvas);
          host?.appendChild(pageWrapper);

          const context = canvas.getContext("2d", {
            alpha: false,
          });

          if (!context) {
            throw new Error(
              "Canvas 2D is unavailable"
            );
          }

          const renderTask = page.render({
            canvas,
            canvasContext: context,
            viewport,
          });

          renderTasks.push(renderTask);

          await renderTask.promise;
        }

        if (cancelled) return;

        if (pdfDocument.numPages > pagesToDraw) {
          const note = document.createElement("p");

          note.className =
            "px-4 pb-4 text-center text-xs text-neutral-500";

          note.textContent = isId
            ? `Hanya ${pagesToDraw} halaman pertama ditampilkan. Unduh PDF untuk melihat semua halaman.`
            : `Showing the first ${pagesToDraw} pages. Download PDF to view the rest.`;

          host?.appendChild(note);
        }

        setLoading(false);
      } catch (cause) {
        if (!cancelled) {
          console.error(
            "CV PDF canvas preview failed:",
            cause
          );

          setError(true);
          setLoading(false);
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;

      renderTasks.forEach((task) => {
        task.cancel();
      });

      // hentikan proses pdf lama ketika template berganti
      if (loadingTask) {
        void loadingTask.destroy().catch(() => {});
      }
    };
  }, [
    blob,
    containerWidth,
    zoom,
    isId,
    onPageCount,
    documentLabel,
  ]);

  return (
    <div className="relative min-w-0">
      {loading && (
        <p className="absolute inset-x-3 top-4 z-10 rounded-lg bg-white/90 px-3 py-2 text-center text-xs text-neutral-600 shadow-sm dark:bg-neutral-900/90 dark:text-neutral-300">
          {isId
            ? "Menyiapkan pratinjau..."
            : "Rendering preview..."}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mx-3 my-4 rounded-lg bg-white/90 p-3 text-center text-sm text-red-600 dark:bg-neutral-900 dark:text-red-400"
        >
          {isId
            ? "Pratinjau tidak tersedia di perangkat ini. File PDF masih dapat diunduh."
            : "Preview unavailable on this device. You can still download the PDF."}
        </p>
      )}

      <div
        ref={hostRef}
        className="min-h-[180px] min-w-0 overflow-x-auto px-3 py-3"
      />
    </div>
  );
}
