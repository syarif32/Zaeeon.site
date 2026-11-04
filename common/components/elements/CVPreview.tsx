"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";

const CV_PATH = "/cv/muhammad-najwa-syarif.pdf";
const CV_FILENAME = "CV-Muhammad-Najwa-Syarif.pdf";

export default function CVPreview() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isId = useLocale() === "id";

  const openPreview = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closePreview = () => dialogRef.current?.close();

  return (
    <section aria-labelledby="cv-heading" className="my-8 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="mb-4">
        <h2 id="cv-heading" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Curriculum Vitae
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {isId ? "Lihat pengalaman, pendidikan, proyek, dan kemampuan teknis saya dalam satu dokumen." : "Explore my experience, education, projects, and technical background in one document."}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={openPreview}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800"
          aria-haspopup="dialog"
        >
          Preview CV
        </button>
        <a
          href={CV_PATH}
          download={CV_FILENAME}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Download CV
        </a>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Preview Curriculum Vitae"
        onClick={(event) => {
          if (event.target === event.currentTarget) closePreview();
        }}
        className="m-auto w-[min(94vw,950px)] max-h-[94vh] overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/70 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h3 className="truncate text-sm font-semibold">Curriculum Vitae</h3>
          <button
            type="button"
            onClick={closePreview}
            aria-label={isId ? "Tutup preview CV" : "Close CV preview"}
            className="rounded-md px-3 py-1 text-sm hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:hover:bg-neutral-800"
          >
            {isId ? "Tutup" : "Close"} ✕
          </button>
        </div>
        <iframe
          title={isId ? "Dokumen Curriculum Vitae" : "Curriculum Vitae document"}
          src={`${CV_PATH}#view=FitH`}
          className="block h-[min(74vh,780px)] w-full bg-white"
        />
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <a
            href={CV_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            {isId ? "Buka PDF di tab baru" : "Open PDF in new tab"}
          </a>
          <a
            href={CV_PATH}
            download={CV_FILENAME}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
          >
            Download PDF
          </a>
        </div>
      </dialog>
    </section>
  );
}
