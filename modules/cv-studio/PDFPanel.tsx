
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { pdf } from "@react-pdf/renderer";

import {
  HiOutlineArrowsPointingOut,
  HiOutlineArrowDownTray,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineXMark,
} from "react-icons/hi2";

import PDFCanvasPreview from "./PDFCanvasPreview";
import ResumeDocument from "./ResumeDocument";
import DocxDownloadButton from "./DocxDownloadButton";
import CVPageAlert from "./CVPageAlert";

import type { ResumeData } from "./model";

type GeneratedPdf = {
  url: string;
  blob: Blob;
};

type Props = {
  resume: ResumeData;
  isId: boolean;
};

// tipe minimal untuk membaca jumlah halaman melalui PDF.js
type PdfJsModule = {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument: (options: {
    data: Uint8Array;
  }) => {
    promise: Promise<{
      numPages: number;
    }>;
    destroy: () => Promise<void>;
  };
};

export default function PDFPanel({
  resume,
  isId,
}: Props) {
  // status pratinjau
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // menentukan viewer desktop atau canvas mobile
  const [useDesktopViewer, setUseDesktopViewer] =
    useState(false);

  // zoom pada mobile fullscreen
  const [zoom, setZoom] = useState(1);

  // data PDF yang sudah dihasilkan
  const [pdfFile, setPdfFile] =
    useState<GeneratedPdf | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // jumlah halaman PDF sebenarnya
  const [pageCount, setPageCount] =
    useState<number | null>(null);

  // referensi untuk pengelolaan PDF
  const latestPdfRef =
    useRef<GeneratedPdf | null>(null);

  const renderVersionRef = useRef(0);

  // referensi fullscreen
  const fullscreenButtonRef =
    useRef<HTMLButtonElement>(null);

  const modalRef =
    useRef<HTMLDivElement>(null);

  const closeRef =
    useRef<HTMLButtonElement>(null);

  // deteksi perangkat
  // mobile dengan mode desktop tetap menggunakan canvas
  useEffect(() => {
    const media = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    const updateViewer = () => {
      const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches ||
        navigator.maxTouchPoints > 0;

      setUseDesktopViewer(
        media.matches && !isTouchDevice
      );
    };

    updateViewer();

    media.addEventListener("change", updateViewer);
    window.addEventListener("resize", updateViewer);

    return () => {
      media.removeEventListener("change", updateViewer);
      window.removeEventListener("resize", updateViewer);
    };
  }, []);

  // membuat nama file berdasarkan nama pengguna
  const safeName =
    (resume.profile.name.trim() || "CV")
      .replace(/[^a-z0-9 _-]/gi, "")
      .trim()
      .replace(/\s+/g, "-") || "CV";

  const fileName =
    `${safeName}-${resume.template}.pdf`;

  // membuat PDF setiap kali data CV berubah
  useEffect(() => {
    const version = ++renderVersionRef.current;
    let cancelled = false;

    setLoading(true);
    setError(false);
    setPageCount(null);

    async function generatePdf() {
      try {
        const blob = await pdf(
          <ResumeDocument resume={resume} />
        ).toBlob();

        // abaikan hasil dari render sebelumnya
        if (
          cancelled ||
          version !== renderVersionRef.current
        ) {
          return;
        }

        const url = URL.createObjectURL(blob);
        const previous = latestPdfRef.current;

        const next: GeneratedPdf = {
          blob,
          url,
        };

        latestPdfRef.current = next;
        setPdfFile(next);

        // hapus URL lama agar tidak bocor memori
        if (previous) {
          URL.revokeObjectURL(previous.url);
        }

        setLoading(false);
      } catch (cause) {
        if (
          !cancelled &&
          version === renderVersionRef.current
        ) {
          console.error(
            "CV PDF generation failed:",
            cause
          );

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

  // menghitung jumlah halaman PDF pada semua perangkat
  // sehingga desktop tidak bergantung pada PDFCanvasPreview
  useEffect(() => {
    if (!pdfFile) return;

    let cancelled = false;

    async function countPdfPages() {
      let task:
        | ReturnType<PdfJsModule["getDocument"]>
        | undefined;

      try {
        // menggunakan PDF.js yang sudah tersedia
        // di folder public proyek CV Studio
        const modulePath =
          "/pdfjs/v5.4.624/pdf.min.mjs";

        const pdfjs = (await import(
          /* webpackIgnore: true */ modulePath
        )) as PdfJsModule;

        pdfjs.GlobalWorkerOptions.workerSrc =
          "/pdfjs/v5.4.624/pdf.worker.min.mjs";

        const buffer =
          await pdfFile!.blob.arrayBuffer();

        if (cancelled) return;

        task = pdfjs.getDocument({
          data: new Uint8Array(buffer),
        });

        const document = await task.promise;

        if (
          !cancelled &&
          latestPdfRef.current?.blob === pdfFile!.blob
        ) {
          setPageCount(document.numPages);
        }
      } catch (cause) {
        if (!cancelled) {
          console.error(
            "Could not determine PDF page count:",
            cause
          );
        }
      } finally {
        if (task) {
          await task.destroy().catch(() => undefined);
        }
      }
    }

    void countPdfPages();

    return () => {
      cancelled = true;
    };
  }, [pdfFile]);

  // hapus object URL ketika komponen dilepas
  useEffect(() => {
    return () => {
      const current = latestPdfRef.current;

      if (current) {
        URL.revokeObjectURL(current.url);
      }
    };
  }, []);

  // kendali modal fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
        return;
      }

      if (
        event.key !== "Tab" ||
        !modalRef.current
      ) {
        return;
      }

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]:not([aria-disabled="true"])'
        )
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        event.shiftKey &&
        document.activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      fullscreenButtonRef.current?.focus();
    };
  }, [isFullscreen]);

  // download hanya aktif jika PDF sudah siap
  const canDownload =
    Boolean(pdfFile) && !loading && !error;

  const fileUrl = canDownload
    ? pdfFile?.url
    : undefined;

  const downloadLabel = isId
    ? "Unduh PDF gratis"
    : "Download free PDF";

  // callback untuk PDFCanvasPreview mobile
  const handlePageCount = (count: number) => {
    if (
      !loading &&
      !error &&
      count > 0
    ) {
      setPageCount(count);
    }
  };

  return (
    <div className="space-y-3">
      {/* HEADER PRATINJAU */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {isId
              ? "Pratinjau dokumen"
              : "Document preview"}
          </h2>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            A4 · {resume.template.toUpperCase()}

            {pageCount !== null
              ? ` · ${pageCount} ${
                  isId
                    ? "halaman"
                    : pageCount === 1
                    ? "page"
                    : "pages"
                }`
              : ""}
          </p>
        </div>

        {/* TOMBOL PENGATURAN DAN DOWNLOAD */}
        <div className="flex flex-wrap items-center gap-2">
          {/* MINIMIZE */}
          <button
            type="button"
            aria-expanded={isPreviewOpen}
            onClick={() =>
              setIsPreviewOpen((open) => !open)
            }
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {isPreviewOpen
              ? isId
                ? "Minimalkan"
                : "Minimize"
              : isId
              ? "Tampilkan CV"
              : "Show CV"}
          </button>

          {/* FULLSCREEN */}
          <button
            ref={fullscreenButtonRef}
            type="button"
            onClick={() => {
              setZoom(1);
              setIsFullscreen(true);
            }}
            aria-label={
              isId
                ? "Lihat CV layar penuh"
                : "View CV fullscreen"
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <HiOutlineArrowsPointingOut size={16} />

            <span>
              {isId ? "Layar penuh" : "Fullscreen"}
            </span>
          </button>

          {/* DOWNLOAD PDF */}
          <a
            href={fileUrl}
            download={fileName}
            aria-disabled={!canDownload}
            onClick={(event) => {
              if (!canDownload) {
                event.preventDefault();
              }
            }}
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900 ${
              canDownload
                ? "hover:bg-neutral-700 dark:hover:bg-neutral-300"
                : "pointer-events-none opacity-50"
            }`}
          >
            <HiOutlineArrowDownTray size={16} />

            {loading
              ? isId
                ? "Menyiapkan..."
                : "Preparing..."
              : error
              ? isId
                ? "Gagal membuat PDF"
                : "PDF error"
              : downloadLabel}
          </a>

          {/* DOWNLOAD DOCX */}
          <DocxDownloadButton
            resume={resume}
            isId={isId}
          />
        </div>
      </div>

      {/* PERINGATAN JUMLAH HALAMAN */}
      {/* hanya muncul jika lebih dari 2 halaman */}
      {/* tidak memblokir PDF atau DOCX */}
      <CVPageAlert
        pageCount={loading ? null : pageCount}
        isId={isId}
      />

      {/* PREVIEW PADA HALAMAN UTAMA */}
      {isPreviewOpen && !isFullscreen && (
        <div
          className={`h-[650px] rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-950 ${
            useDesktopViewer
              ? "overflow-hidden"
              : "overflow-y-auto overflow-x-hidden"
          }`}
        >
          {loading ? (
            <p className="p-5 text-center text-sm text-neutral-600 dark:text-neutral-400">
              {isId
                ? "Memperbarui pratinjau..."
                : "Updating preview..."}
            </p>
          ) : error ? (
            <p
              role="alert"
              className="p-5 text-center text-sm text-red-600"
            >
              {isId
                ? "PDF gagal dibuat. Periksa kembali konten CV."
                : "Could not generate PDF. Please check your CV data."}
            </p>
          ) : pdfFile ? (
            useDesktopViewer ? (
              <iframe
                key={pdfFile.url}
                src={pdfFile.url}
                title={
                  isId
                    ? "Pratinjau CV"
                    : "CV preview"
                }
                className="block h-full w-full border-0 bg-white"
              />
            ) : (
              <PDFCanvasPreview
                key={pdfFile.url}
                blob={pdfFile.blob}
                isId={isId}
                onPageCount={handlePageCount}
              />
            )
          ) : null}
        </div>
      )}

      {/* INFORMASI PRIVASI */}
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {isId
          ? "PDF dan DOCX dibuat langsung di browsermu. Data CV tidak dikirim ke server."
          : "PDF and DOCX are generated in your browser. Your CV data is not sent to a server."}
      </p>

      {/* MODAL FULLSCREEN */}
      {isFullscreen &&
      typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-5"
              onMouseDown={(event) => {
                if (
                  event.target ===
                  event.currentTarget
                ) {
                  setIsFullscreen(false);
                }
              }}
            >
              <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cv-fullscreen-title"
                className="flex h-[95dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-2xl"
              >
                {/* HEADER MODAL */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-neutral-800 px-3 py-3 sm:px-5">
                  <div className="min-w-0">
                    <h2
                      id="cv-fullscreen-title"
                      className="text-sm font-semibold text-white sm:text-base"
                    >
                      {isId
                        ? "Pratinjau CV"
                        : "CV Preview"}
                    </h2>

                    <p className="text-xs text-neutral-400">
                      A4 · {resume.template}

                      {pageCount !== null
                        ? ` · ${pageCount} ${
                            isId
                              ? "halaman"
                              : pageCount === 1
                              ? "page"
                              : "pages"
                          }`
                        : ""}
                    </p>
                  </div>

                  {/* TOOLBAR MODAL */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* ZOOM KHUSUS MOBILE */}
                    {!useDesktopViewer && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setZoom((value) =>
                              Math.max(
                                0.7,
                                Math.round(
                                  (value - 0.2) * 10
                                ) / 10
                              )
                            )
                          }
                          disabled={zoom <= 0.7}
                          aria-label={
                            isId
                              ? "Perkecil"
                              : "Zoom out"
                          }
                          className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40"
                        >
                          −
                        </button>

                        <span
                          className="w-10 text-center text-xs text-neutral-200"
                          aria-live="polite"
                        >
                          {Math.round(zoom * 100)}%
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setZoom((value) =>
                              Math.min(
                                2,
                                Math.round(
                                  (value + 0.2) * 10
                                ) / 10
                              )
                            )
                          }
                          disabled={zoom >= 2}
                          aria-label={
                            isId
                              ? "Perbesar"
                              : "Zoom in"
                          }
                          className="h-9 w-9 rounded-lg border border-neutral-700 text-white disabled:opacity-40"
                        >
                          +
                        </button>
                      </>
                    )}

                    {/* BUKA PDF DI TAB BARU */}
                    {/* terpisah dari tombol unduh */}
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-neutral-700 px-3 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
                      >
                        <HiOutlineArrowTopRightOnSquare
                          size={15}
                        />

                        <span className="hidden sm:inline">
                          {isId
                            ? "Buka PDF"
                            : "Open PDF"}
                        </span>
                      </a>
                    )}

                    {/* DOWNLOAD PDF FULLSCREEN */}
                    <a
                      href={fileUrl}
                      download={fileName}
                      aria-disabled={!canDownload}
                      onClick={(event) => {
                        if (!canDownload) {
                          event.preventDefault();
                        }
                      }}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-neutral-900 ${
                        canDownload
                          ? "hover:bg-neutral-200"
                          : "pointer-events-none opacity-50"
                      }`}
                    >
                      <HiOutlineArrowDownTray
                        size={16}
                      />

                      <span className="hidden sm:inline">
                        {isId ? "Unduh PDF" : "Download PDF"}
                      </span>
                    </a>

                    {/* TUTUP FULLSCREEN */}
                    <button
                      ref={closeRef}
                      type="button"
                      onClick={() =>
                        setIsFullscreen(false)
                      }
                      aria-label={
                        isId
                          ? "Tutup pratinjau"
                          : "Close preview"
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    >
                      <HiOutlineXMark size={20} />
                    </button>
                  </div>
                </div>

                {/* ISI MODAL */}
                <div
                  className={`min-h-0 flex-1 bg-neutral-800 ${
                    useDesktopViewer
                      ? "overflow-hidden"
                      : "overflow-auto"
                  }`}
                >
                  {loading ? (
                    <p className="p-6 text-center text-sm text-neutral-200">
                      {isId
                        ? "Memperbarui pratinjau..."
                        : "Updating preview..."}
                    </p>
                  ) : error ? (
                    <p className="p-6 text-center text-sm text-red-400">
                      {isId
                        ? "Pratinjau gagal dibuat."
                        : "Preview failed."}
                    </p>
                  ) : pdfFile ? (
                    useDesktopViewer ? (
                      <iframe
                        key={`modal-${pdfFile.url}`}
                        src={pdfFile.url}
                        title={
                          isId
                            ? "Pratinjau CV layar penuh"
                            : "Fullscreen CV preview"
                        }
                        className="block h-full w-full border-0 bg-white"
                      />
                    ) : (
                      <PDFCanvasPreview
                        key={`modal-${pdfFile.url}`}
                        blob={pdfFile.blob}
                        zoom={zoom}
                        isId={isId}
                        onPageCount={handlePageCount}
                      />
                    )
                  ) : null}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
