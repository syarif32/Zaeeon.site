"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineArrowsPointingOut,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineXMark,
} from "react-icons/hi2";
import { LETTER_PRESETS } from "./coverLetterModel";
import type { LetterOutput } from "./coverLetterModel";

// Komponen canvas milik CV Studio tetap digunakan di perangkat sentuh.
const PDFCanvasPreview = dynamic(() => import("./PDFCanvasPreview"), {
  ssr: false,
  loading: () => <p className="p-6 text-center text-xs text-neutral-500">Loading PDF...</p>,
});

type Generated = { blob: Blob; url: string };

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: Uint8Array }) => {
    promise: Promise<{ numPages: number }>;
    destroy: () => Promise<void>;
  };
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export default function CoverLetterPreview({
  letter,
  isId,
  isUpdating = false,
}: {
  letter: LetterOutput;
  isId: boolean;
  isUpdating?: boolean;
}) {
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [useDesktopViewer, setUseDesktopViewer] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const latestRef = useRef<Generated | null>(null);
  const versionRef = useRef(0);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Seperti CV Studio: iframe native untuk desktop dengan pointer halus,
  // canvas untuk mobile, tablet, serta desktop dengan perangkat sentuh.
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      const touch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      setUseDesktopViewer(media.matches && !touch);
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const version = ++versionRef.current;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setPageCount(null);

    async function generate() {
      try {
        const { exportCoverLetterPDF } = await import("./coverLetterExport");
        const blob = await exportCoverLetterPDF(letter);
        if (cancelled || version !== versionRef.current) return;

        const next = { blob, url: URL.createObjectURL(blob) };
        const previous = latestRef.current;
        latestRef.current = next;
        setGenerated(next);
        if (previous) URL.revokeObjectURL(previous.url);
        setLoading(false);
      } catch (error) {
        if (cancelled || version !== versionRef.current) return;
        console.error("Cover letter PDF generation failed:", error);
        setFailed(true);
        setLoading(false);
      }
    }

    void generate();
    return () => { cancelled = true; };
  }, [letter]);

  // Jumlah halaman tetap diketahui pada desktop yang memakai iframe.
  useEffect(() => {
    if (!generated) return;
    let cancelled = false;
    let task: ReturnType<PdfJsModule["getDocument"]> | undefined;

    async function countPages() {
      try {
        const modulePath = "/pdfjs/v5.4.624/pdf.min.mjs";
        const pdfjs = (await import(/* webpackIgnore: true */ modulePath)) as PdfJsModule;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/v5.4.624/pdf.worker.min.mjs";
        const data = new Uint8Array(await generated!.blob.arrayBuffer());
        if (cancelled) return;
        task = pdfjs.getDocument({ data });
        const pdfDocument = await task.promise;
        if (!cancelled && latestRef.current?.blob === generated!.blob) {
          setPageCount(pdfDocument.numPages);
        }
      } catch (error) {
        if (!cancelled) console.error("Could not count cover-letter pages:", error);
      } finally {
        if (task) await task.destroy().catch(() => undefined);
      }
    }

    void countPages();
    return () => { cancelled = true; };
  }, [generated]);

  useEffect(() => () => {
    if (latestRef.current) URL.revokeObjectURL(latestRef.current.url);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]:not([aria-disabled="true"])'),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
      fullscreenButtonRef.current?.focus();
    };
  }, [fullscreen]);

  const fileStem = [letter.form.name, "Cover-Letter", letter.form.company]
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "Cover-Letter";

  const pdfDisabled = !generated || loading || failed || isUpdating;
  const docxDisabled = docxLoading || isUpdating;
  const secondary = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800";
  const primary = "inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300";

  function downloadPDF() {
    if (pdfDisabled || !generated) return;
    downloadBlob(generated.blob, `${fileStem}.pdf`);
  }

  async function downloadDOCX() {
    if (docxDisabled) return;
    setDocxLoading(true);
    setNotice("");
    try {
      const { exportCoverLetterDOCX } = await import("./coverLetterExport");
      const blob = await exportCoverLetterDOCX(letter);
      downloadBlob(blob, `${fileStem}.docx`);
    } catch (error) {
      console.error("Cover letter DOCX export failed:", error);
      setNotice(isId ? "Gagal membuat DOCX. Coba lagi." : "Could not generate DOCX. Try again.");
    } finally {
      setDocxLoading(false);
    }
  }

  function documentViewer(inModal: boolean) {
    return (
      <div className={`${inModal ? "h-full" : "h-[650px]"} ${(isUpdating || loading) ? "pointer-events-none" : ""} min-w-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-950`}>
        {failed ? (
          <p role="alert" className="p-5 text-center text-sm text-red-600 dark:text-red-400">
            {isId ? "PDF gagal dibuat. Periksa data surat lalu coba ubah salah satu isian." : "PDF generation failed. Review the letter and try updating a field."}
          </p>
        ) : generated ? (
          useDesktopViewer ? (
            <iframe
              key={`${inModal ? "modal" : "main"}-${generated.url}`}
              src={generated.url}
              title={isId ? "Pratinjau surat lamaran" : "Cover letter preview"}
              className="block h-full w-full border-0 bg-white"
            />
          ) : (
            <div className="h-full overflow-y-auto overflow-x-hidden">
              <PDFCanvasPreview
                key={`${inModal ? "modal" : "main"}-${generated.url}`}
                blob={generated.blob}
                isId={isId}
                zoom={zoom}
                onPageCount={setPageCount}
                documentLabel={isId ? "Surat lamaran" : "Cover letter"}
              />
            </div>
          )
        ) : (
          <p className="p-6 text-center text-sm text-neutral-500">{isId ? "Menyiapkan PDF..." : "Preparing PDF..."}</p>
        )}
        {(loading || isUpdating) && !failed ? (
          <p role="status" className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-lg bg-white/95 px-3 py-2 text-center text-xs text-neutral-600 shadow-sm dark:bg-neutral-900/95 dark:text-neutral-200">
            {isId ? "Memperbarui pratinjau..." : "Updating preview..."}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {isId ? "Pratinjau dokumen" : "Document preview"}
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            A4 · PDF · {LETTER_PRESETS[letter.template].label}
            {pageCount !== null ? ` · ${pageCount} ${isId ? "halaman" : pageCount === 1 ? "page" : "pages"}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={secondary} aria-expanded={previewOpen} onClick={() => setPreviewOpen((v) => !v)}>
            {previewOpen ? (isId ? "Minimalkan" : "Minimize") : (isId ? "Tampilkan PDF" : "Show PDF")}
          </button>
          <button type="button" ref={fullscreenButtonRef} className={secondary} onClick={() => { setZoom(1); setFullscreen(true); }}>
            <HiOutlineArrowsPointingOut className="h-4 w-4" />
            {isId ? "Layar penuh" : "Fullscreen"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!useDesktopViewer ? (
          <>
            <button type="button" className={secondary} disabled={zoom <= 0.75} onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))} aria-label={isId ? "Perkecil pratinjau layar penuh" : "Zoom out fullscreen preview"}>
              <HiOutlineMinus className="h-4 w-4" />
            </button>
            <span className="flex min-w-12 items-center justify-center text-xs text-neutral-500 dark:text-neutral-400">{Math.round(zoom * 100)}%</span>
            <button type="button" className={secondary} disabled={zoom >= 1.5} onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.25).toFixed(2)))} aria-label={isId ? "Perbesar pratinjau layar penuh" : "Zoom in fullscreen preview"}>
              <HiOutlinePlus className="h-4 w-4" />
            </button>
          </>
        ) : null}
        <div className="flex-1" />
        <button type="button" className={primary} disabled={pdfDisabled} onClick={downloadPDF}>
          <HiOutlineArrowDownTray className="h-4 w-4" /> {isId ? "Unduh PDF" : "Download PDF"}
        </button>
        <button type="button" className={secondary} disabled={docxDisabled} onClick={() => void downloadDOCX()}>
          <HiOutlineArrowDownTray className="h-4 w-4" />
          {docxLoading ? (isId ? "Menyiapkan..." : "Preparing...") : "DOCX"}
        </button>
      </div>

      {pageCount !== null && pageCount > 1 ? (
        <p role="status" className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          {isId ? `Surat ini ${pageCount} halaman. Umumnya cover letter 1 halaman; unduhan tetap tersedia.` : `This letter is ${pageCount} pages. One page is typical; downloads remain available.`}
        </p>
      ) : null}
      {notice ? <p role="alert" className="text-xs text-red-600">{notice}</p> : null}

      {previewOpen && !fullscreen ? (
        <div className="relative">{documentViewer(false)}</div>
      ) : null}
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {isId
          ? "PDF dibuat langsung di browser dan sesuai file unduhan. DOCX bisa diedit, tetapi pemenggalan baris dapat sedikit berbeda di Word."
          : "PDF is generated locally and matches the downloaded file. DOCX is editable, though line wrapping can differ in Word."}
      </p>

      {fullscreen && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setFullscreen(false); }}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="cover-letter-modal-title" className="flex h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl">
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-800 px-3 py-3 sm:px-5">
              <div>
                <h2 id="cover-letter-modal-title" className="text-sm font-semibold text-white sm:text-base">
                  {isId ? "Pratinjau Surat Lamaran" : "Cover Letter Preview"}
                </h2>
                <p className="mt-1 text-xs text-neutral-400">A4 · {LETTER_PRESETS[letter.template].label}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!useDesktopViewer ? (
                  <>
                    <button type="button" className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40" aria-label="Zoom out" disabled={zoom <= 0.75} onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}>−</button>
                    <span className="w-10 text-center text-xs text-neutral-200">{Math.round(zoom * 100)}%</span>
                    <button type="button" className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40" aria-label="Zoom in" disabled={zoom >= 1.5} onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.25).toFixed(2)))}>+</button>
                  </>
                ) : null}
                {generated && !pdfDisabled ? (
                  <a href={generated.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-700 px-3 text-xs text-neutral-200 hover:bg-neutral-800">
                    <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
                    <span className="hidden sm:inline">{isId ? "Buka PDF" : "Open PDF"}</span>
                  </a>
                ) : null}
                <button type="button" disabled={pdfDisabled} onClick={downloadPDF} className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-900 disabled:opacity-40">
                  <HiOutlineArrowDownTray className="h-4 w-4" /> PDF
                </button>
                <button type="button" ref={closeRef} onClick={() => setFullscreen(false)} aria-label={isId ? "Tutup pratinjau" : "Close preview"} className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800">
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 bg-neutral-800">{documentViewer(true)}</div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
