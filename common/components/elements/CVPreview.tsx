
"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";

const CV_PATH = "/cv/cv.pdf";
const CV_FILENAME = "CV-Muhammad-Najwa-Syarif.pdf";

export default function CVPreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isId = useLocale() === "id";

  const openPreview = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closePreview = () => {
    dialogRef.current?.close();
  };

  return (
    <section
      aria-labelledby="cv-heading"
      className="my-8"
    >
      {/* section heading */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-neutral-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h8" />
          </svg>
        </div>

        <div>
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
      </div>

      {/* cv document card */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
          {/* document information */}
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/60">
              <div className="flex flex-col items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-600 dark:text-neutral-300"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8" />
                </svg>

                <span className="text-[9px] font-bold tracking-wide text-blue-500">
                  PDF
                </span>
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Muhammad Najwa Syarif
              </h3>

              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isId
                  ? "Curriculum Vitae · Dokumen PDF"
                  : "Curriculum Vitae · PDF Document"}
              </p>

              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {isId
                    ? "Tersedia untuk dilihat dan diunduh"
                    : "Available for preview and download"}
                </span>
              </div>
            </div>
          </div>

          {/* document actions */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={openPreview}
              aria-haspopup="dialog"
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800 sm:flex-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.06 12a10.94 10.94 0 0 1 19.88 0 10.94 10.94 0 0 1-19.88 0Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>

              {isId ? "Lihat CV" : "Preview"}
            </button>

            <a
              href={CV_PATH}
              download={CV_FILENAME}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:flex-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>

              {isId ? "Unduh CV" : "Download"}
            </a>
          </div>
        </div>

        {/* bottom information */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50/50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-900/40">
          <span className="text-xs text-neutral-500 dark:text-neutral-500">
            {isId ? "Format dokumen" : "Document format"}
          </span>

          <span className="font-mono text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
            PDF
          </span>
        </div>
      </div>

      {/* cv preview modal */}
      <dialog
        ref={dialogRef}
        aria-labelledby="cv-modal-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePreview();
          }
        }}
        className="m-auto w-[calc(100%-1.5rem)] max-w-5xl overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/75 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 sm:w-[94vw]"
      >
        <div className="flex max-h-[95dvh] flex-col">
          {/* modal header */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-600 dark:text-neutral-300"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8" />
                </svg>
              </div>

              <div className="min-w-0">
                <h3
                  id="cv-modal-title"
                  className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                >
                  Curriculum Vitae
                </h3>

                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  Muhammad Najwa Syarif
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closePreview}
              aria-label={isId ? "Tutup pratinjau" : "Close preview"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* pdf viewer */}
          <div className="min-h-0 flex-1 bg-neutral-100 dark:bg-neutral-900">
            <iframe
              title={
                isId
                  ? "Pratinjau Curriculum Vitae"
                  : "Curriculum Vitae Preview"
              }
              src={`${CV_PATH}#view=FitH`}
              className="block h-[min(68dvh,780px)] w-full bg-white"
            />
          </div>

          {/* modal footer */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950 sm:px-5">
            <span className="hidden text-xs text-neutral-500 dark:text-neutral-400 sm:block">
              {isId
                ? "Dokumen PDF · Curriculum Vitae"
                : "PDF Document · Curriculum Vitae"}
            </span>

            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <a
                href={CV_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h6v6" />
                  <path d="M10 14 21 3" />
                  <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                </svg>

                {isId ? "Tab Baru" : "New Tab"}
              </a>

              <a
                href={CV_PATH}
                download={CV_FILENAME}
                className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>

                {isId ? "Unduh PDF" : "Download PDF"}
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </section>
  );
}
