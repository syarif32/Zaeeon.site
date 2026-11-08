"use client";

import { useMemo, useState } from "react";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import ResumeDocument from "./ResumeDocument";
import type { ResumeData } from "./model";

export default function PDFPanel({ resume, isId }: { resume: ResumeData; isId: boolean }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const document = useMemo(() => <ResumeDocument resume={resume} />, [resume]);
  const fileName = `${(resume.profile.name.trim() || "CV").replace(/[^a-z0-9 _-]/gi, "").trim().replace(/\s+/g, "-") || "CV"}-${resume.template}.pdf`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {isId ? "Pratinjau dokumen" : "Document preview"}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">A4 · PDF · {resume.template}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-expanded={isPreviewOpen}
            onClick={() => setIsPreviewOpen((open) => !open)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {isPreviewOpen
              ? (isId ? "Minimalkan" : "Minimize")
              : (isId ? "Tampilkan CV" : "Show CV")}
          </button>
          <PDFDownloadLink
            document={document}
            fileName={fileName}
            className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
          {({ loading, error }) => error
            ? (isId ? "Gagal membuat PDF" : "PDF error")
            : loading ? (isId ? "Menyiapkan..." : "Preparing...")
              : (isId ? "Unduh PDF gratis" : "Download free PDF")}
          </PDFDownloadLink>
        </div>
      </div>
      {isPreviewOpen ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-950">
          <PDFViewer
            width="100%"
            height="650"
            showToolbar={false}
            style={{ display: "block", width: "100%", border: "none" }}
          >
            {document}
          </PDFViewer>
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {isId
          ? "PDF dibuat di perangkatmu. Jika pratinjau tidak tampil di browser HP, gunakan Unduh PDF untuk melihat hasilnya."
          : "Your PDF is generated on your device. If the preview is unavailable on mobile, download the PDF to view it."}
      </p>
    </div>
  );
}
