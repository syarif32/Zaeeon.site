"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { pdf } from "@react-pdf/renderer";
import {
  HiOutlineArrowsPointingOut,
  HiOutlineArrowDownTray,
  HiOutlineXMark,
} from "react-icons/hi2";

import PDFCanvasPreview from "./PDFCanvasPreview";
import ResumeDocument from "./ResumeDocument";
import type { ResumeData } from "./model";

type GeneratedPdf = {
  url: string;
  blob: Blob;
};

export default function PDFPanel({
  resume,
  isId,
}: {
  resume: ResumeData;
  isId: boolean;
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pdfFile, setPdfFile] = useState<GeneratedPdf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);

  const latestPdfRef = useRef<GeneratedPdf | null>(null);
  const renderVersionRef = useRef(0);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const fileName = `${
    (resume.profile.name.trim() || "CV")
      .replace(/[^a-z0-9 _-]/gi, "")
      .trim()
      .replace(/\s+/g, "-") || "CV"
  }-${resume.template}.pdf`;

  // Satu PDF sumber untuk pratinjau dan unduhan.
  // Hasil render lama dibuang agar perpindahan template tidak menumpuk isi.
  useEffect(() => {
    const version = ++renderVersionRef.current;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setPageCount(null);

    async function generatePdf() {
      try {
        const blob = await pdf(<ResumeDocument resume={resume} />).toBlob();
        if (cancelled || version !== renderVersionRef.current) return;

        const url = URL.createObjectURL(blob);
        const previous = latestPdfRef.current;
        const next = { blob, url };
        latestPdfRef.current = next;
        setPdfFile(next);
        if (previous) URL.revokeObjectURL(previous.url);
        setLoading(false);
      } catch (cause) {
        if (!cancelled) {
          console.error("CV PDF generation failed:", cause);
          setError(true);
          setLoading(false);
        }
      }
    }

    void generatePdf();
    return () => {
      cancelled = true;
    };
  }, [resume]);

  // Bersihkan object URL agar tidak membocorkan memori browser.
  useEffect(() => {
    return () => {
      const current = latestPdfRef.current;
      if (current) URL.revokeObjectURL(current.url);
    };
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        return;
      }
      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]:not([aria-disabled="true"])',
        ),
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
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      fullscreenButtonRef.current?.focus();
    };
  }, [isFullscreen]);

  const canDownload = Boolean(pdfFile) && !loading && !error;
  const downloadLabel = isId ? "Unduh PDF gratis" : "Download free PDF";
  const fileUrl = canDownload ? pdfFile?.url : undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {isId ? "Pratinjau dokumen" : "Document preview"}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            A4 · PDF · {resume.template}
            {pageCount ? ` · ${pageCount} ${isId ? "halaman" : pageCount === 1 ? "page" : "pages"}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={isPreviewOpen}
            onClick={() => setIsPreviewOpen((open) => !open)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {isPreviewOpen
              ? isId ? "Minimalkan" : "Minimize"
              : isId ? "Tampilkan CV" : "Show CV"}
          </button>
          <button
            ref={fullscreenButtonRef}
            type="button"
            onClick={() => {
              setZoom(1);
              setIsFullscreen(true);
            }}
            aria-label={isId ? "Lihat CV layar penuh" : "View CV fullscreen"}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <HiOutlineArrowsPointingOut size={16} />
            <span>{isId ? "Layar penuh" : "Fullscreen"}</span>
          </button>
          <a
            href={fileUrl}
            download={fileName}
            aria-disabled={!canDownload}
            onClick={(event) => { if (!canDownload) event.preventDefault(); }}
            className={`inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900 ${canDownload ? "hover:bg-neutral-700 dark:hover:bg-neutral-300" : "pointer-events-none opacity-50"}`}
          >
            {loading
              ? isId ? "Menyiapkan..." : "Preparing..."
              : error ? isId ? "Gagal membuat PDF" : "PDF error"
              : downloadLabel}
          </a>
        </div>
      </div>

      {isPreviewOpen ? (
        <div className="h-[650px] overflow-y-auto overflow-x-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-950">
          {loading ? (
            <p className="p-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {isId ? "Memperbarui pratinjau..." : "Updating preview..."}
            </p>
          ) : error ? (
            <p role="alert" className="p-5 text-center text-sm text-red-600">
              {isId ? "PDF gagal dibuat. Periksa kembali konten CV." : "Could not generate PDF. Please check your CV data."}
            </p>
          ) : pdfFile ? (
            <PDFCanvasPreview
              key={pdfFile.url}
              blob={pdfFile.blob}
              isId={isId}
              onPageCount={setPageCount}
            />
          ) : null}
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {isId
          ? "Pratinjau dan PDF unduhan menggunakan dokumen yang sama. Semua proses dilakukan di browsermu."
          : "Preview and download use the same PDF. Everything is processed in your browser."}
      </p>

      {isFullscreen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setIsFullscreen(false);
              }}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cv-fullscreen-title"
                className="flex h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
              >
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-800 px-3 py-3 sm:px-5">
                  <div className="min-w-0">
                    <h2 id="cv-fullscreen-title" className="text-sm font-semibold text-white sm:text-base">
                      {isId ? "Pratinjau CV" : "CV Preview"}
                    </h2>
                    <p className="text-xs text-neutral-400">A4 · {resume.template}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom((value) => Math.max(0.7, Math.round((value - 0.2) * 10) / 10))}
                      disabled={zoom <= 0.7}
                      aria-label={isId ? "Perkecil" : "Zoom out"}
                      className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-xs text-neutral-200" aria-live="polite">{Math.round(zoom * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoom((value) => Math.min(2, Math.round((value + 0.2) * 10) / 10))}
                      disabled={zoom >= 2}
                      aria-label={isId ? "Perbesar" : "Zoom in"}
                      className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40"
                    >
                      +
                    </button>
                    <a
                      href={fileUrl}
                      download={fileName}
                      aria-disabled={!canDownload}
                      onClick={(event) => { if (!canDownload) event.preventDefault(); }}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-900 ${canDownload ? "hover:bg-neutral-200" : "pointer-events-none opacity-50"}`}
                    >
                      <HiOutlineArrowDownTray size={16} />
                      <span className="hidden sm:inline">{isId ? "Unduh" : "Download"}</span>
                    </a>
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() => setIsFullscreen(false)}
                      aria-label={isId ? "Tutup pratinjau" : "Close preview"}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    >
                      <HiOutlineXMark size={20} />
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto bg-neutral-800">
                  {loading ? (
                    <p className="p-6 text-center text-sm text-neutral-200">
                      {isId ? "Memperbarui pratinjau..." : "Updating preview..."}
                    </p>
                  ) : error ? (
                    <p className="p-6 text-center text-sm text-red-400">
                      {isId ? "Pratinjau gagal dibuat." : "Preview failed."}
                    </p>
                  ) : pdfFile ? (
                    <PDFCanvasPreview
                      key={`modal-${pdfFile.url}`}
                      blob={pdfFile.blob}
                      zoom={zoom}
                      isId={isId}
                      onPageCount={setPageCount}
                    />
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
