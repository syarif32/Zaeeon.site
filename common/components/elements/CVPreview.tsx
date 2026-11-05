
"use client";

import { useRef, useState } from "react";
import { useLocale } from "next-intl";

const CV_PATH = "/cv/cv.pdf";
const CV_FILENAME = "CV-Muhammad-Najwa-Syarif.pdf";

export default function CVPreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isId = useLocale() === "id";

  const openPreview = () => {
    const dialog = dialogRef.current;

    if (!dialog || dialog.open) return;

    dialog.showModal();
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    dialogRef.current?.close();
  };

  const actionClass =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500";

  return (
    <section aria-labelledby="cv-heading" className="my-8">
      <div className="mb-5">
        <h2
          id="cv-heading"
          className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          Curriculum Vitae
        </h2>

        <p className="mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {isId
            ? "Ringkasan pengalaman, pendidikan, dan kemampuan profesional saya."
            : "An overview of my professional experience, education, and skills."}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/60">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h5" />
              </svg>

              <span className="text-[9px] font-bold text-blue-500">
                PDF
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Muhammad Najwa Syarif
              </h3>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Curriculum Vitae · PDF
              </p>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Tersedia untuk dilihat dan diunduh"
                  : "Available to view and download"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* desktop: modal preview */}
            <button
              type="button"
              onClick={openPreview}
              aria-haspopup="dialog"
              className={`${actionClass} hidden border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-200 dark:hover:bg-neutral-800 lg:inline-flex`}
            >
              {isId ? "Lihat CV" : "Preview CV"}
            </button>

            {/* mobile: buka pdf hanya setelah diklik */}
            <a
              href={CV_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionClass} flex-1 border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-200 dark:hover:bg-neutral-800 lg:hidden`}
            >
              {isId ? "Lihat CV" : "View CV"}
            </a>

            <a
              href={CV_PATH}
              download={CV_FILENAME}
              className={`${actionClass} flex-1 bg-blue-600 text-white hover:bg-blue-700 sm:flex-none`}
            >
              {isId ? "Unduh CV" : "Download CV"}
            </a>
          </div>
        </div>
      </div>

      {/* viewer hanya digunakan pada desktop */}
      <dialog
        ref={dialogRef}
        aria-labelledby="cv-modal-title"
        onClose={() => setIsPreviewOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePreview();
          }
        }}
        className="m-auto w-[94vw] max-w-5xl overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/75 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
      >
        <div className="flex max-h-[94dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <div>
              <h3
                id="cv-modal-title"
                className="text-sm font-semibold"
              >
                Curriculum Vitae
              </h3>

              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Muhammad Najwa Syarif
              </p>
            </div>

            <button
              type="button"
              onClick={closePreview}
              aria-label={isId ? "Tutup pratinjau" : "Close preview"}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              {isId ? "Tutup" : "Close"} ×
            </button>
          </div>

          {/* pdf tidak dimuat ketika dialog tertutup */}
          {isPreviewOpen && (
            <iframe
              title={
                isId
                  ? "Pratinjau Curriculum Vitae"
                  : "Curriculum Vitae Preview"
              }
              src={`${CV_PATH}#view=FitH`}
              className="block h-[min(74dvh,780px)] w-full bg-white"
            />
          )}

          <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
            <a
              href={CV_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className={`${actionClass} border border-neutral-200 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800`}
            >
              {isId ? "Tab Baru" : "New Tab"}
            </a>

            <a
              href={CV_PATH}
              download={CV_FILENAME}
              className={`${actionClass} bg-blue-600 text-white hover:bg-blue-700`}
            >
              {isId ? "Unduh PDF" : "Download PDF"}
            </a>
          </div>
        </div>
      </dialog>
    </section>
  );
}
