
"use client";

import { useState } from "react";
import type { ResumeData } from "./model";

export default function DocxDownloadButton({
  resume,
  isId,
}: {
  resume: ResumeData;
  isId: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const { generateResumeDocx } =
        await import("./DocxGenerator");

      const blob =
        await generateResumeDocx(resume);

      const url =
        URL.createObjectURL(blob);

      const safeName = (
        resume.profile.name.trim() || "CV"
      )
        .replace(/[^a-z0-9 _-]/gi, "")
        .trim()
        .replace(/\s+/g, "-") || "CV";

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        `${safeName}-${resume.template}.docx`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(
        () => URL.revokeObjectURL(url),
        1500
      );
    } catch (cause) {
      console.error(
        "DOCX export failed:",
        cause
      );

      setError(
        isId
          ? "Gagal menyiapkan DOCX."
          : "Could not generate DOCX."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void handleDownload()}
        disabled={busy}
        className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-blue-400 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        {busy
          ? isId
            ? "Menyiapkan DOCX..."
            : "Preparing DOCX..."
          : isId
          ? "Unduh DOCX"
          : "Download DOCX"}
      </button>

      {error && (
        <p
          role="alert"
          className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}
